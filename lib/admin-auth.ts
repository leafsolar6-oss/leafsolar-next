import 'server-only';

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify, SignJWT } from 'jose';
import { db } from '@/lib/db';

const COOKIE_NAME = 'leafsolar_admin_session';
const SESSION_ISSUER = 'leafsolar-admin';

type AdminSession = {
  id: number;
  email: string;
  name: string;
};

type AdminRow = {
  id: number | string;
  email: string;
  name: string;
};

function sessionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Admin authentication is not configured.');
  return new TextEncoder().encode(secret);
}

function hashCode(adminId: number, code: string) {
  return createHmac('sha256', sessionKey()).update(`${adminId}:${code}`).digest('hex');
}

function sameHash(first: string, second: string) {
  const a = Buffer.from(first, 'hex');
  const b = Buffer.from(second, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { issuer: SESSION_ISSUER, audience: 'leafsolar-admin' });
    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.name !== 'string') return null;
    return { id: Number(payload.sub), email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}

export async function createAdminSession(admin: AdminSession) {
  const token = await new SignJWT({ email: admin.email, name: admin.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(admin.id))
    .setIssuer(SESSION_ISSUER)
    .setAudience('leafsolar-admin')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(sessionKey());
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function requestAdminLoginCode(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const sql = db();
  const admins = await sql`
    SELECT id, email, name FROM admin_users
    WHERE LOWER(email) = ${email} AND is_active = true
    LIMIT 1
  ` as AdminRow[];
  const admin = admins[0];
  if (!admin) return { ok: true as const, email };

  const [{ recent_count }] = await sql`
    SELECT COUNT(*)::int AS recent_count
    FROM admin_login_codes
    WHERE admin_user_id = ${admin.id} AND created_at > NOW() - INTERVAL '15 minutes'
  ` as { recent_count: number }[];
  if (Number(recent_count) >= 5) return { ok: false as const, error: 'Too many sign-in codes were requested. Please wait 15 minutes and try again.' };

  const code = randomInt(100000, 1000000).toString();
  const adminId = Number(admin.id);
  const inserted = await sql`
    INSERT INTO admin_login_codes (admin_user_id, code_hash, expires_at)
    VALUES (${adminId}, ${hashCode(adminId, code)}, NOW() + INTERVAL '10 minutes')
    RETURNING id
  ` as { id: number | string }[];
  const codeId = inserted[0].id;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    await sql`DELETE FROM admin_login_codes WHERE id = ${codeId}`;
    throw new Error('Admin sign-in email is not configured.');
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.OTP_FROM_EMAIL || 'Leaf Solar <no-reply@leafsolar.ng>',
      to: admin.email,
      subject: `${code} is your Leaf Solar admin sign-in code`,
      text: `Your Leaf Solar inventory sign-in code is ${code}. It expires in 10 minutes and can be used once. If you did not request this code, you can ignore this email.`,
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    console.error('Admin sign-in email failed', response.status, await response.text());
    await sql`DELETE FROM admin_login_codes WHERE id = ${codeId}`;
    throw new Error('The sign-in code could not be emailed. Please try again.');
  }
  return { ok: true as const, email: admin.email };
}

export async function verifyAdminLoginCode(emailInput: string, codeInput: string) {
  const email = emailInput.trim().toLowerCase();
  const code = codeInput.trim();
  if (!/^\d{6}$/.test(code)) return { ok: false as const, error: 'Enter the six-digit code from your email.' };
  const sql = db();
  const admins = await sql`
    SELECT id, email, name FROM admin_users
    WHERE LOWER(email) = ${email} AND is_active = true
    LIMIT 1
  ` as AdminRow[];
  const admin = admins[0];
  if (!admin) return { ok: false as const, error: 'That code is invalid or has expired.' };

  const codes = await sql`
    SELECT id, code_hash, attempts
    FROM admin_login_codes
    WHERE admin_user_id = ${admin.id}
      AND consumed_at IS NULL
      AND expires_at > NOW()
      AND attempts < 5
    ORDER BY created_at DESC
    LIMIT 1
  ` as { id: number | string; code_hash: string; attempts: number }[];
  const record = codes[0];
  if (!record) return { ok: false as const, error: 'That code is invalid or has expired.' };

  const attempted = await sql`
    UPDATE admin_login_codes SET attempts = attempts + 1
    WHERE id = ${record.id} AND consumed_at IS NULL AND attempts < 5
    RETURNING id
  `;
  if (!attempted[0] || !sameHash(record.code_hash, hashCode(Number(admin.id), code))) {
    return { ok: false as const, error: 'That code is invalid or has expired.' };
  }

  const consumed = await sql`
    UPDATE admin_login_codes SET consumed_at = NOW()
    WHERE id = ${record.id} AND consumed_at IS NULL
    RETURNING id
  `;
  if (!consumed[0]) return { ok: false as const, error: 'That code is invalid or has expired.' };
  await sql`UPDATE admin_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ${admin.id}`;
  await createAdminSession({ id: Number(admin.id), email: admin.email, name: admin.name });
  return { ok: true as const };
}
