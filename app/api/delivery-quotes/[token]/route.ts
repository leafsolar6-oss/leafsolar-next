import { NextResponse } from 'next/server';
import { getPublicDeliveryQuote } from '@/lib/delivery-quotes';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await getPublicDeliveryQuote(token);
  if (!quote) return NextResponse.json({ error: 'Delivery quote not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json(quote, { headers: { 'Cache-Control': 'no-store' } });
}
