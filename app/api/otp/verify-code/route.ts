import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otp-store';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || 'demo');
  const code = String(body.code || '').replace(/\D/g, '');
  const result = verifyOtp(username, code);
  return NextResponse.json(result);
}
