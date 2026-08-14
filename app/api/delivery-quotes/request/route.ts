import { NextResponse } from 'next/server';
import { checkoutSchema, checkoutValidationError, CheckoutError, priceOrderItems } from '@/lib/checkout';
import { createDeliveryQuoteRequest } from '@/lib/delivery-quotes';

export const runtime = 'nodejs';

function siteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try { return new URL(configured).origin; } catch { /* use request origin */ }
  }
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'This delivery quote request was blocked.' }, { status: 403 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(checkoutValidationError(parsed.error), { status: 400 });

  try {
    const order = await priceOrderItems(parsed.data.items);
    const quote = await createDeliveryQuoteRequest(parsed.data, order, siteOrigin(request));
    return NextResponse.json(quote, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof CheckoutError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Delivery quote request failed', error);
    return NextResponse.json({ error: 'We could not create the delivery quote request. Please try again or contact Leaf Solar.' }, { status: 502 });
  }
}
