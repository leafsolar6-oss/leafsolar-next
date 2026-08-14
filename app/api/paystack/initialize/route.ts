import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { checkoutSchema, checkoutValidationError, CheckoutError } from '@/lib/checkout';
import { initializePaystackPayment } from '@/lib/paystack';

export const runtime = 'nodejs';

function siteOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try { return new URL(configured).origin; } catch { /* fall back to the request origin */ }
  }
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'This checkout request was blocked.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(checkoutValidationError(parsed.error), { status: 400 });
  }

  const reference = `LS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(12).toString('hex').toUpperCase()}`;
  const callbackUrl = new URL('/api/paystack/callback', siteOrigin(request)).toString();

  try {
    const payment = await initializePaystackPayment(parsed.data, reference, callbackUrl);
    return NextResponse.json(payment, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(checkoutValidationError(error), { status: 400 });
    }
    console.error('Paystack initialization failed', error);
    const notConfigured = error instanceof Error && error.message === 'Paystack is not configured.';
    return NextResponse.json(
      { error: notConfigured ? 'Online payment is temporarily unavailable. Please contact Leaf Solar.' : 'We could not open secure payment. Please try again or contact Leaf Solar.' },
      { status: notConfigured ? 503 : 502 },
    );
  }
}
