import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(6),
  pkg: z.string().optional(),
  message: z.string().optional(),
});

const deliveryError = 'Online enquiries are temporarily unavailable. Please use WhatsApp or call +234 703 756 1216.';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the required fields and try again.' }, { status: 400 });
  const d = parsed.data;

  const subject = `New lead — ${d.name} (${d.phone})`;
  const text = [
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email || '—'}`,
    `Interested in: ${d.pkg || 'General enquiry'}`,
    '',
    d.message || '',
  ].join('\n');

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || 'hello@leafsolar.ng';
  const from = process.env.OTP_FROM_EMAIL || 'Leaf Solar <no-reply@leafsolar.ng>';

  if (!key) {
    console.error('Contact delivery is unavailable: RESEND_API_KEY is not configured.');
    return NextResponse.json({ error: deliveryError }, { status: 503 });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text }),
    });

    if (!response.ok) {
      console.error('Resend contact delivery failed', response.status, await response.text());
      return NextResponse.json({ error: deliveryError }, { status: 502 });
    }
  } catch (error) {
    console.error('Resend contact delivery failed', error);
    return NextResponse.json({ error: deliveryError }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
