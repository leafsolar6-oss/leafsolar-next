import { NextResponse } from 'next/server';
import { generateCode, setOtp } from '@/lib/otp-store';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || 'demo');
  const code = generateCode();
  setOtp(username, code, 600);

  const to = process.env.OTP_TO_EMAIL || 'abodjaneb@gmail.com';
  const from = process.env.OTP_FROM_EMAIL || 'Leaf Solar <no-reply@leafsolar.ng>';
  const key = process.env.RESEND_API_KEY;

  if (key) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from, to,
          subject: 'Your Wells Fargo verification code',
          text: `Your verification code is ${code}. It expires in 10 minutes.`,
        }),
      });
    } catch (e) { console.error('email send failed', e); }
  } else {
    console.log('[otp] code for', username, ':', code);
  }

  // For local / demo we include the code. In production remove `demo_code`.
  return NextResponse.json({ ok: true, to, expires_in: 600, demo_code: code });
}
