import 'server-only';

import { randomBytes } from 'node:crypto';
import type { CheckoutInput, PricedOrder } from '@/lib/checkout';
import { CheckoutError } from '@/lib/checkout';
import { canonicalOrderItems, isIbadanDeliveryArea } from '@/lib/delivery';
import { db } from '@/lib/db';
import { whatsappUrl } from '@/lib/data';

export type DeliveryQuoteResolution = {
  kind: 'ibadan-free' | 'approved-quote';
  deliveryAmount: number;
  quoteCode: string | null;
  quoteToken: string | null;
  existingPayment: { authorizationUrl: string; reference: string } | null;
};

type QuoteRow = {
  id: number | string;
  code: string;
  public_token: string;
  status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  customer_notes: string;
  items_json: unknown;
  subtotal: number | string;
  delivery_amount: number | string | null;
  payment_reference: string | null;
  payment_url: string | null;
};

function parsedItems(value: unknown) {
  if (typeof value === 'string') {
    try { return JSON.parse(value) as unknown; } catch { return []; }
  }
  return value;
}

function sameItems(quoteItems: unknown, submitted: CheckoutInput['items']) {
  const expected = canonicalOrderItems(Array.isArray(parsedItems(quoteItems))
    ? (parsedItems(quoteItems) as Array<{ id: number; quantity: number }>)
    : []);
  const actual = canonicalOrderItems(submitted);
  return JSON.stringify(expected) === JSON.stringify(actual);
}

function comparable(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function sameCustomer(row: QuoteRow, customer: CheckoutInput['customer']) {
  return comparable(row.customer_first_name) === comparable(customer.firstName)
    && comparable(row.customer_last_name) === comparable(customer.lastName)
    && comparable(row.customer_email) === comparable(customer.email)
    && comparable(row.customer_phone) === comparable(customer.phone)
    && comparable(row.delivery_address) === comparable(customer.address)
    && comparable(row.delivery_city) === comparable(customer.city)
    && comparable(row.delivery_state) === comparable(customer.state);
}

export async function createDeliveryQuoteRequest(input: CheckoutInput, order: PricedOrder, origin: string) {
  if (isIbadanDeliveryArea(input.customer.city, input.customer.state)) {
    throw new CheckoutError('This Ibadan address already qualifies for free delivery. Continue to secure payment.', 409);
  }

  const sql = db();
  const code = `LSQ-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(3).toString('hex').toUpperCase()}`;
  const publicToken = randomBytes(24).toString('hex');
  const items = canonicalOrderItems(input.items);
  await sql`
    INSERT INTO delivery_quotes (
      code, public_token, customer_first_name, customer_last_name, customer_email,
      customer_phone, delivery_address, delivery_city, delivery_state, customer_notes,
      items_json, subtotal
    ) VALUES (
      ${code}, ${publicToken}, ${input.customer.firstName}, ${input.customer.lastName}, ${input.customer.email},
      ${input.customer.phone}, ${input.customer.address}, ${input.customer.city}, ${input.customer.state}, ${input.customer.notes || ''},
      ${JSON.stringify(items)}::jsonb, ${order.subtotal}
    )
  `;

  const customerCheckoutUrl = new URL(`/checkout?quote=${publicToken}`, origin).toString();
  const adminReviewUrl = new URL(`/admin/delivery-quotes?code=${encodeURIComponent(code)}`, origin).toString();
  const itemSummary = order.lines.map(line => `${line.quantity} × ${line.product.name}`).join('; ');
  const message = [
    'Hello Leaf Solar, I need an approved delivery quote before Paystack payment.',
    `Quote request: ${code}`,
    `Customer: ${input.customer.firstName} ${input.customer.lastName}`,
    `Phone: ${input.customer.phone}`,
    `Delivery: ${input.customer.address}, ${input.customer.city}, ${input.customer.state}`,
    `Products: ${itemSummary}`,
    `Product subtotal: ₦${order.subtotal.toLocaleString('en-NG')}`,
    `Owner review: ${adminReviewUrl}`,
    `Approved checkout link: ${customerCheckoutUrl}`,
  ].join('\n');

  return { code, token: publicToken, status: 'requested', customerCheckoutUrl, adminReviewUrl, whatsappUrl: whatsappUrl(message) };
}

export async function getPublicDeliveryQuote(token: string) {
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const rows = await db()`
    SELECT code, status, subtotal, delivery_amount, payment_reference
    FROM delivery_quotes WHERE public_token = ${token} LIMIT 1
  ` as Array<{ code: string; status: string; subtotal: number | string; delivery_amount: number | string | null; payment_reference: string | null }>;
  const row = rows[0];
  if (!row) return null;
  return {
    code: row.code,
    status: row.status,
    subtotal: Number(row.subtotal),
    deliveryAmount: row.delivery_amount === null ? null : Number(row.delivery_amount),
    paymentReady: Boolean(row.payment_reference),
  };
}

export async function resolveDeliveryQuote(input: CheckoutInput, order: PricedOrder): Promise<DeliveryQuoteResolution> {
  if (isIbadanDeliveryArea(input.customer.city, input.customer.state)) {
    return { kind: 'ibadan-free', deliveryAmount: 0, quoteCode: null, quoteToken: null, existingPayment: null };
  }

  const token = input.deliveryQuoteToken || '';
  if (!token) throw new CheckoutError('A Leaf Solar delivery quote must be approved before Paystack payment for this location.', 409);
  if (!/^[a-f0-9]{48}$/.test(token)) throw new CheckoutError('This delivery quote link is invalid. Request a new quote.', 409);

  const rows = await db()`SELECT * FROM delivery_quotes WHERE public_token = ${token} LIMIT 1` as QuoteRow[];
  const row = rows[0];
  if (!row) throw new CheckoutError('This delivery quote was not found. Request a new quote.', 409);
  if (row.status === 'requested') throw new CheckoutError(`Delivery quote ${row.code} is awaiting owner approval.`, 409);
  if (row.status === 'declined' || row.status === 'expired') throw new CheckoutError(`Delivery quote ${row.code} is no longer available. Request a new quote.`, 409);
  if (row.status === 'paid') throw new CheckoutError(`Delivery quote ${row.code} has already been used for a paid order.`, 409);
  if (!['approved', 'payment_ready'].includes(row.status) || row.delivery_amount === null) {
    throw new CheckoutError('This delivery quote is not ready for payment.', 409);
  }
  if (!sameCustomer(row, input.customer)) {
    throw new CheckoutError(`The checkout details do not match delivery quote ${row.code}. Use the same name, phone and address submitted for the quote.`, 409);
  }
  if (!sameItems(row.items_json, input.items) || Number(row.subtotal) !== order.subtotal) {
    throw new CheckoutError(`The cart no longer matches delivery quote ${row.code}. Request an updated quote.`, 409);
  }

  return {
    kind: 'approved-quote',
    deliveryAmount: Number(row.delivery_amount),
    quoteCode: row.code,
    quoteToken: row.public_token,
    existingPayment: row.status === 'payment_ready' && row.payment_reference && row.payment_url
      ? { authorizationUrl: row.payment_url, reference: row.payment_reference }
      : null,
  };
}

export async function attachDeliveryQuotePayment(token: string, reference: string, authorizationUrl: string) {
  const rows = await db()`
    UPDATE delivery_quotes
    SET status = 'payment_ready', payment_reference = ${reference}, payment_url = ${authorizationUrl}, updated_at = NOW()
    WHERE public_token = ${token} AND status = 'approved' AND payment_reference IS NULL
    RETURNING code
  ` as Array<{ code: string }>;
  if (!rows[0]) throw new CheckoutError('This delivery quote payment session is already in use. Reopen the approved checkout link.', 409);
}
