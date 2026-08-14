import { NextResponse } from 'next/server';
import { deliverPaidOrder, isValidPaystackReference, verifyPaystackPayment } from '@/lib/paystack';

export const runtime = 'nodejs';

function statusUrl(request: Request, reference?: string, error?: string) {
  const url = new URL('/checkout/payment-status', request.url);
  if (reference) url.searchParams.set('reference', reference);
  if (error) url.searchParams.set('error', error);
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || url.searchParams.get('trxref') || '';
  if (!isValidPaystackReference(reference)) {
    return NextResponse.redirect(statusUrl(request, undefined, 'invalid-reference'));
  }

  try {
    const payment = await verifyPaystackPayment(reference);
    try {
      await deliverPaidOrder(payment);
    } catch (error) {
      console.error('Verified Paystack order notification failed', error);
    }
    return NextResponse.redirect(statusUrl(request, reference));
  } catch (error) {
    console.error('Paystack callback verification failed', error);
    return NextResponse.redirect(statusUrl(request, reference, 'not-confirmed'));
  }
}
