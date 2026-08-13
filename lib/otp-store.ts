// In-memory OTP store. For production use Upstash Redis or Vercel KV.
// Each entry: { code, expires, attempts }
const store = new Map<string, { code: string; expires: number; attempts: number }>();

export function setOtp(key: string, code: string, ttlSeconds = 600) {
  store.set(key, { code, expires: Date.now() + ttlSeconds * 1000, attempts: 0 });
}

export function verifyOtp(key: string, code: string): { ok: boolean; error?: string } {
  const e = store.get(key);
  if (!e) return { ok: false, error: 'expired' };
  if (Date.now() > e.expires) { store.delete(key); return { ok: false, error: 'expired' }; }
  if (e.attempts >= 5) { store.delete(key); return { ok: false, error: 'too_many' }; }
  e.attempts++;
  if (e.code !== code) return { ok: false, error: 'invalid' };
  store.delete(key);
  return { ok: true };
}

export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
