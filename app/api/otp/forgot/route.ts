import { NextResponse } from 'next/server';
import { generateCode, setOtp } from '@/lib/otp-store';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || 'demo');
  const code = generateCode();
  setOtp('reset:' + username, code, 900);
  const to = process.env.OTP_TO_EMAIL || 'abodjaneb@gmail.com';
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.OTP_FROM_EMAIL || 'Leaf Solar <no-reply@leafsolar.ng>',
          to, subject: 'Reset your password',
          text: `Your reset code is ${code}. It expires in 15 minutes.`,
        }),
      });
    } catch (e) { console.error(e); }
  }
  return NextResponse.json({ ok: true, to, demo_code: code });
}
