import 'server-only';

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

export function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('The inventory database is not configured.');
  if (!client) client = neon(url);
  return client;
}
