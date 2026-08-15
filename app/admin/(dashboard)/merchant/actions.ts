'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { runMerchantAudit, sanitizeMerchantError } from '@/lib/merchant-api';
import { saveMerchantAudit, saveMerchantAuditFailure } from '@/lib/merchant-audit-store';

export async function refreshMerchantAudit() {
  await requireAdmin();
  try {
    const summary = await runMerchantAudit();
    await saveMerchantAudit(summary);
    revalidatePath('/admin/merchant');
  } catch (error) {
    await saveMerchantAuditFailure(sanitizeMerchantError(error));
  }
  redirect('/admin/merchant');
}
