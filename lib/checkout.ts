import { z } from 'zod';
import type { Product } from '@/lib/data';
import { getAuthoritativeProductsByIds } from '@/lib/catalog-store';

export const customerSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(30),
  address: z.string().trim().min(3).max(240),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(1000).optional().default(''),
});

export const orderItemSchema = z.object({
  id: z.coerce.number().int(),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1).max(30),
  deliveryQuoteToken: z.string().trim().max(100).optional(),
});

export const storedPaystackOrderSchema = z.union([
  checkoutSchema.omit({ deliveryQuoteToken: true }).extend({ version: z.literal(1) }),
  z.object({
    version: z.literal(2),
    customer: customerSchema,
    items: z.array(orderItemSchema.extend({ unitPrice: z.number().int().positive() })).min(1).max(30),
  }),
  z.object({
    version: z.literal(3),
    customer: customerSchema,
    items: z.array(orderItemSchema.extend({ unitPrice: z.number().int().positive() })).min(1).max(30),
    delivery: z.object({
      kind: z.enum(['ibadan-free', 'approved-quote']),
      amount: z.number().int().min(0),
      quoteCode: z.string().trim().max(100).nullable(),
    }),
  }),
]);

export type CheckoutCustomer = z.infer<typeof customerSchema>;
export type CheckoutItem = z.infer<typeof orderItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

const customerFieldErrors: Record<string, { error: string; field: string }> = {
  firstName: { error: 'Enter your first name.', field: 'firstName' },
  lastName: { error: 'Enter your last name.', field: 'lastName' },
  email: { error: 'Enter a valid email address.', field: 'email' },
  phone: { error: 'Enter a valid phone number with at least 7 characters.', field: 'phone' },
  address: { error: 'Enter your delivery street address.', field: 'address' },
  city: { error: 'Enter your delivery city or town.', field: 'city' },
  state: { error: 'Select your delivery state.', field: 'state' },
  notes: { error: 'Order notes must be 1,000 characters or fewer.', field: 'notes' },
};

export function checkoutValidationError(error: z.ZodError) {
  const issue = error.issues[0];
  if (issue?.path[0] === 'customer' && typeof issue.path[1] === 'string') {
    return customerFieldErrors[issue.path[1]] || { error: 'Please check your contact and delivery details.' };
  }
  if (issue?.path[0] === 'items') {
    return { error: 'Your cart contains an invalid item or quantity. Please return to your cart and try again.' };
  }
  return { error: 'Please check your checkout details and try again.' };
}

export type PricedOrderLine = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

export type PricedOrder = {
  lines: PricedOrderLine[];
  subtotal: number;
};

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.status = status;
  }
}

export async function priceOrderItems(items: CheckoutItem[]): Promise<PricedOrder> {
  const quantities = new Map<number, number>();
  for (const item of items) {
    const quantity = (quantities.get(item.id) || 0) + item.quantity;
    if (quantity > 20) throw new CheckoutError('A product quantity is above the allowed limit.');
    quantities.set(item.id, quantity);
  }

  const authoritativeProducts = await getAuthoritativeProductsByIds([...quantities.keys()]);
  const productsById = new Map(authoritativeProducts.map(product => [product.id, product]));
  const lines: PricedOrderLine[] = [];
  let subtotal = 0;

  for (const [id, quantity] of quantities) {
    const product = productsById.get(id);
    if (!product || !product.inStock) {
      throw new CheckoutError('One of the selected items is no longer available.', 409);
    }
    if (product.trackInventory && quantity > (product.stockQuantity || 0)) {
      throw new CheckoutError(`${product.name} does not have enough stock for that quantity.`, 409);
    }
    if (!Number.isSafeInteger(product.price) || product.price <= 0) {
      throw new CheckoutError('One of the selected items cannot be purchased online.', 409);
    }
    const lineTotal = product.price * quantity;
    subtotal += lineTotal;
    lines.push({ product, quantity, lineTotal });
  }

  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
    throw new CheckoutError('The order total is invalid.');
  }

  return { lines, subtotal };
}
