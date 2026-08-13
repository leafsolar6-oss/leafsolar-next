import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(6),
  pkg: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const d = parsed.data;

  const subject = `New lead — ${d.name} (${d.phone})`;
  const text = [
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email || '—'}`,
    `Interested in: ${d.pkg || 'Just browsing'}`,
    ``,
    d.message || '',
  ].join('\n');

  // Try Resend if configured; otherwise log (Vercel function logs).
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || 'hello@leafsolar.ng';
  const from = process.env.OTP_FROM_EMAIL || 'Leaf Solar <no-reply@leafsolar.ng>';
  if (key) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, text }),
      });
      if (!res.ok) console.error('Resend failed', await res.text());
    } catch (e) { console.error(e); }
  } else {
    console.log('[contact]', subject, '\n', text);
  }

  return NextResponse.json({ ok: true });
}
