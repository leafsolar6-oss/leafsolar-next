import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { checkoutSchema, priceOrderItems, storedPaystackOrderSchema, type CheckoutInput, type PricedOrder } from '@/lib/checkout';
import { getAuthoritativeProductsByIds } from '@/lib/catalog-store';
import { formatNaira } from '@/lib/data';
import { db } from '@/lib/db';
import { attachDeliveryQuotePayment, resolveDeliveryQuote } from '@/lib/delivery-quotes';

const PAYSTACK_API = 'https://api.paystack.co';
const REFERENCE_PATTERN = /^[A-Za-z0-9._=-]{6,100}$/;

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

type InitializedTransaction = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  channel?: string | null;
  metadata?: unknown;
  customer?: { email?: string | null } | null;
};

export type VerifiedPayment = {
  reference: string;
  customer: CheckoutInput['customer'];
  order: PricedOrder;
  deliveryAmount: number;
  deliveryKind: 'ibadan-free' | 'approved-quote' | 'legacy-unspecified';
  total: number;
  quoteCode: string | null;
  paidAt: string;
  channel: string;
};

function paystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key || !key.startsWith('sk_')) throw new Error('Paystack is not configured.');
  return key;
}

async function paystackFetch<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => null) as PaystackResponse<T> | null;
  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || `Paystack request failed with status ${response.status}.`);
  }
  return payload.data;
}

export function isValidPaystackReference(reference: string) {
  return REFERENCE_PATTERN.test(reference);
}

export async function initializePaystackPayment(input: CheckoutInput, reference: string, callbackUrl: string) {
  const parsed = checkoutSchema.parse(input);
  const order = await priceOrderItems(parsed.items);
  const delivery = await resolveDeliveryQuote(parsed, order);
  const total = order.subtotal + delivery.deliveryAmount;

  if (delivery.existingPayment) {
    return {
      authorizationUrl: delivery.existingPayment.authorizationUrl,
      reference: delivery.existingPayment.reference,
      subtotal: order.subtotal,
      deliveryAmount: delivery.deliveryAmount,
      total,
      quoteCode: delivery.quoteCode,
    };
  }

  const data = await paystackFetch<InitializedTransaction>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: parsed.customer.email,
      amount: total * 100,
      currency: 'NGN',
      reference,
      callback_url: callbackUrl,
      metadata: {
        leafSolarOrder: {
          version: 3,
          customer: parsed.customer,
          items: order.lines.map(line => ({ id: line.product.id, quantity: line.quantity, unitPrice: line.product.price })),
          delivery: {
            kind: delivery.kind,
            amount: delivery.deliveryAmount,
            quoteCode: delivery.quoteCode,
          },
        },
        cancel_action: `${new URL(callbackUrl).origin}/checkout${delivery.quoteToken ? `?quote=${delivery.quoteToken}` : ''}`,
        custom_fields: [
          { display_name: 'Customer name', variable_name: 'customer_name', value: `${parsed.customer.firstName} ${parsed.customer.lastName}` },
          { display_name: 'Phone number', variable_name: 'phone_number', value: parsed.customer.phone },
          { display_name: 'Order reference', variable_name: 'order_reference', value: reference },
          ...(delivery.quoteCode ? [{ display_name: 'Delivery quote', variable_name: 'delivery_quote', value: delivery.quoteCode }] : []),
        ],
      },
    }),
  });

  if (data.reference !== reference || !data.authorization_url.startsWith('https://checkout.paystack.com/')) {
    throw new Error('Paystack returned an invalid checkout session.');
  }
  if (delivery.quoteToken) await attachDeliveryQuotePayment(delivery.quoteToken, reference, data.authorization_url);

  return {
    authorizationUrl: data.authorization_url,
    reference,
    subtotal: order.subtotal,
    deliveryAmount: delivery.deliveryAmount,
    total,
    quoteCode: delivery.quoteCode,
  };
}

function parseStoredOrder(metadata: unknown) {
  let value = metadata;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { throw new Error('Payment metadata is invalid.'); }
  }
  const parsed = storedPaystackOrderSchema.safeParse(
    value && typeof value === 'object' && 'leafSolarOrder' in value
      ? (value as { leafSolarOrder: unknown }).leafSolarOrder
      : null,
  );
  if (!parsed.success) throw new Error('Payment order details are missing or invalid.');
  return parsed.data;
}

async function priceStoredOrder(stored: ReturnType<typeof parseStoredOrder>): Promise<PricedOrder> {
  if (stored.version === 1) return priceOrderItems(stored.items);

  const products = await getAuthoritativeProductsByIds(stored.items.map(item => item.id), { includeInactive: true });
  const productsById = new Map(products.map(product => [product.id, product]));
  const lines: PricedOrder['lines'] = [];
  let subtotal = 0;

  for (const item of stored.items) {
    const product = productsById.get(item.id);
    if (!product) throw new Error('A paid order product no longer exists.');
    const lineTotal = item.unitPrice * item.quantity;
    if (!Number.isSafeInteger(lineTotal) || lineTotal <= 0) throw new Error('Payment order pricing is invalid.');
    subtotal += lineTotal;
    lines.push({ product: { ...product, price: item.unitPrice }, quantity: item.quantity, lineTotal });
  }
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) throw new Error('Payment order total is invalid.');
  return { lines, subtotal };
}

export async function verifyPaystackPayment(reference: string): Promise<VerifiedPayment> {
  if (!isValidPaystackReference(reference)) throw new Error('Payment reference is invalid.');

  const transaction = await paystackFetch<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (transaction.reference !== reference || transaction.status !== 'success') {
    throw new Error('Payment has not been completed.');
  }
  if (transaction.currency !== 'NGN') throw new Error('Payment currency does not match the order.');

  const stored = parseStoredOrder(transaction.metadata);
  const order = await priceStoredOrder(stored);
  const deliveryAmount = stored.version === 3 ? stored.delivery.amount : 0;
  const deliveryKind = stored.version === 3 ? stored.delivery.kind : 'legacy-unspecified';
  const quoteCode = stored.version === 3 ? stored.delivery.quoteCode : null;
  const total = order.subtotal + deliveryAmount;
  if (transaction.amount !== total * 100) throw new Error('Payment amount does not match the order total.');
  if (!transaction.customer?.email || transaction.customer.email.toLowerCase() !== stored.customer.email.toLowerCase()) {
    throw new Error('Payment customer does not match the order.');
  }

  return {
    reference,
    customer: stored.customer,
    order,
    deliveryAmount,
    deliveryKind,
    total,
    quoteCode,
    paidAt: transaction.paid_at || new Date().toISOString(),
    channel: transaction.channel || 'Paystack',
  };
}

async function sendEmail({ to, replyTo, subject, text, idempotencyKey }: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.OTP_FROM_EMAIL || 'Leaf Solar <no-reply@leafsolar.ng>';
  if (!key) throw new Error('Order email delivery is not configured.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ from, to, reply_to: replyTo, subject, text }),
  });
  if (!response.ok) throw new Error(`Order email delivery failed with status ${response.status}: ${await response.text()}`);
}

async function recordPaidOrderAndDeductInventory(payment: VerifiedPayment) {
  const sql = db();
  const inventoryItems = payment.order.lines.map(line => ({ product_id: line.product.id, quantity: line.quantity }));
  const storedItems = payment.order.lines.map(line => ({
    id: line.product.id,
    name: line.product.name,
    sku: line.product.sku,
    quantity: line.quantity,
    unitPrice: line.product.price,
    lineTotal: line.lineTotal,
  }));
  await sql.query(`
    WITH claim AS (
      INSERT INTO fulfilled_orders (
        reference, amount, subtotal, delivery_amount, delivery_kind, customer_email,
        customer_first_name, customer_last_name, customer_phone,
        delivery_address, delivery_city, delivery_state, customer_notes,
        payment_channel, paid_at, status, items_json, delivery_quote_code,
        fulfilled_at, updated_at
      ) VALUES (
        $1, $2, $14, $15, $18, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12::timestamptz, 'paid', $13::jsonb, $16, NOW(), NOW()
      )
      ON CONFLICT (reference) DO NOTHING
      RETURNING reference
    ), ordered AS (
      SELECT product_id, SUM(quantity)::int AS quantity
      FROM jsonb_to_recordset($17::jsonb) AS item(product_id bigint, quantity integer)
      GROUP BY product_id
    ), locked AS MATERIALIZED (
      SELECT p.id, p.stock_quantity AS quantity_before, ordered.quantity
      FROM products p
      JOIN ordered ON ordered.product_id = p.id
      CROSS JOIN claim
      WHERE p.track_inventory = true
      FOR UPDATE OF p
    ), updated AS (
      UPDATE products p
      SET stock_quantity = GREATEST(locked.quantity_before - locked.quantity, 0), updated_at = NOW()
      FROM locked
      WHERE p.id = locked.id
      RETURNING p.id, p.stock_quantity, locked.quantity_before
    ), quote_paid AS (
      UPDATE delivery_quotes
      SET status = 'paid', paid_at = $12::timestamptz, updated_at = NOW()
      WHERE code = $16 AND payment_reference = $1 AND EXISTS (SELECT 1 FROM claim)
      RETURNING id
    )
    INSERT INTO inventory_movements (product_id, change_quantity, quantity_after, reason, reference)
    SELECT id, stock_quantity - quantity_before, stock_quantity, 'Paid website order', $1
    FROM updated
  `, [
    payment.reference, payment.total, payment.customer.email,
    payment.customer.firstName, payment.customer.lastName, payment.customer.phone,
    payment.customer.address, payment.customer.city, payment.customer.state,
    payment.customer.notes || '', payment.channel, payment.paidAt,
    JSON.stringify(storedItems), payment.order.subtotal, payment.deliveryAmount,
    payment.quoteCode, JSON.stringify(inventoryItems), payment.deliveryKind,
  ]);
}

export async function deliverPaidOrder(payment: VerifiedPayment) {
  const { reference, customer, order, deliveryAmount, deliveryKind, total, quoteCode, paidAt, channel } = payment;
  await recordPaidOrderAndDeductInventory(payment);
  const deliveryLabel = deliveryKind === 'approved-quote'
    ? `${formatNaira(deliveryAmount)}${quoteCode ? ` — approved quote ${quoteCode}` : ' — approved delivery quote'}`
    : deliveryKind === 'ibadan-free'
      ? 'Free — Ibadan'
      : 'Not recorded in this legacy payment';
  const itemLines = order.lines.map(line => `${line.quantity} × ${line.product.name} (${line.product.sku || line.product.id}) — ${formatNaira(line.lineTotal)}`);
  const businessText = [
    `PAID WEBSITE ORDER — ${reference}`,
    '',
    `Payment status: PAID AND VERIFIED`,
    `Amount paid: ${formatNaira(total)}`,
    `Products: ${formatNaira(order.subtotal)}`,
    `Delivery: ${deliveryLabel}`,
    ...(quoteCode ? [`Delivery quote: ${quoteCode}`] : []),
    `Payment channel: ${channel}`,
    `Paid at: ${paidAt}`,
    '',
    `Customer: ${customer.firstName} ${customer.lastName}`,
    `Phone: ${customer.phone}`,
    `Email: ${customer.email}`,
    `Delivery address: ${customer.address}, ${customer.city}, ${customer.state}`,
    '',
    'ORDER ITEMS',
    ...itemLines,
    '',
    `TOTAL PAID: ${formatNaira(total)}`,
    `Order notes: ${customer.notes || '—'}`,
    '',
    'Payment was verified directly with Paystack. Contact the customer to arrange delivery.',
  ].join('\n');

  await sendEmail({
    to: process.env.CONTACT_TO_EMAIL || 'hello@leafsolar.ng',
    replyTo: customer.email,
    subject: `PAID order ${reference} — ${formatNaira(total)}`,
    text: businessText,
    idempotencyKey: `leafsolar-paystack-business-${reference}`,
  });

  const customerText = [
    `Hello ${customer.firstName},`,
    '',
    `We have received your payment of ${formatNaira(total)} for order ${reference}.`,
    '',
    'ORDER ITEMS',
    ...itemLines,
    '',
    `Delivery: ${deliveryLabel}`,
    '',
    'Leaf Solar will contact you to arrange delivery. This paid order records the approved delivery amount for the agreed address; any customer-requested change to the address or scope will be reviewed separately.',
    '',
    'Need help? Call +234 703 756 1216 or reply to this email.',
    '',
    'Thank you for shopping with Leaf Solar Ltd.',
  ].join('\n');

  try {
    await sendEmail({
      to: customer.email,
      replyTo: process.env.CONTACT_TO_EMAIL || 'hello@leafsolar.ng',
      subject: `Payment received — Leaf Solar order ${reference}`,
      text: customerText,
      idempotencyKey: `leafsolar-paystack-customer-${reference}`,
    });
  } catch (error) {
    console.error('Customer payment receipt email failed', error);
  }
}

export function isValidPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac('sha512', paystackSecret()).update(rawBody).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const suppliedBuffer = Buffer.from(signature, 'utf8');
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}
