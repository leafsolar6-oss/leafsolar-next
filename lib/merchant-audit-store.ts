import 'server-only';

import { db } from './db';
import type { MerchantAuditSummary } from './merchant-api';

export type StoredMerchantAudit = {
  id: number;
  account_id: string;
  status: 'success' | 'failed';
  summary: MerchantAuditSummary | { generatedAt: string; error: string; destructiveChanges: [] };
  created_at: string;
};

async function ensureTable() {
  const sql = db();
  await sql`
    CREATE TABLE IF NOT EXISTS merchant_audits (
      id BIGSERIAL PRIMARY KEY,
      account_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
      summary JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS merchant_audits_created_at_idx
    ON merchant_audits (created_at DESC)
  `;
}

export async function saveMerchantAudit(summary: MerchantAuditSummary) {
  await ensureTable();
  const sql = db();
  await sql`
    INSERT INTO merchant_audits (account_id, status, summary)
    VALUES (${summary.accountId}, 'success', ${JSON.stringify(summary)}::jsonb)
  `;
}

export async function saveMerchantAuditFailure(error: string) {
  await ensureTable();
  const sql = db();
  const summary = {
    generatedAt: new Date().toISOString(),
    error,
    destructiveChanges: [] as [],
  };
  await sql`
    INSERT INTO merchant_audits (account_id, status, summary)
    VALUES ('unknown', 'failed', ${JSON.stringify(summary)}::jsonb)
  `;
}

export async function latestMerchantAudit(): Promise<StoredMerchantAudit | null> {
  await ensureTable();
  const sql = db();
  const rows = await sql`
    SELECT id, account_id, status, summary, created_at
    FROM merchant_audits
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return (rows[0] as StoredMerchantAudit | undefined) || null;
}
