import { NextResponse } from 'next/server';
import { deliverPaidOrder, isValidPaystackReference, isValidPaystackSignature, verifyPaystackPayment } from '@/lib/paystack';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    if (!isValidPaystackSignature(rawBody, request.headers.get('x-paystack-signature'))) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Paystack webhook validation is unavailable', error);
    return NextResponse.json({ error: 'Webhook unavailable.' }, { status: 503 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (event.event !== 'charge.success') return NextResponse.json({ ok: true });
  const reference = event.data?.reference || '';
  if (!isValidPaystackReference(reference)) {
    return NextResponse.json({ error: 'Invalid reference.' }, { status: 400 });
  }

  try {
    const payment = await verifyPaystackPayment(reference);
    await deliverPaidOrder(payment);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Paystack webhook fulfillment failed', error);
    return NextResponse.json({ error: 'Fulfillment failed.' }, { status: 500 });
  }
}
