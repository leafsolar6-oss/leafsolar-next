import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import { requestCodeAction, verifyCodeAction } from '@/app/admin/auth-actions';

export const metadata: Metadata = { title: 'Owner sign in', robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: {
  searchParams: Promise<{ step?: string; email?: string; error?: string; sent?: string }>;
}) {
  if (await getAdminSession()) redirect('/admin');
  const params = await searchParams;
  const verifying = params.step === 'verify' && Boolean(params.email);

  return (
    <div className="min-h-screen bg-[#f2f5f1] px-4 py-10 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-[0_24px_70px_rgba(16,38,26,.12)]">
        <div className="bg-leaf-900 px-7 py-8 text-white sm:px-9">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Leaf Solar storefront">
            <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-white text-leaf-800">
              <svg width="27" height="27" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M7 20c8.5-.2 13.8-5.1 15-14-8.9.4-14.7 4.8-15 14Z" fill="currentColor"/><path d="M7 21c3.5-5.7 7.2-8.8 12-11.5" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/></svg>
            </span>
            <span><b className="block font-display text-lg">LEAFSOLAR</b><span className="text-[10px] font-bold uppercase tracking-[.2em] text-white/60">Inventory manager</span></span>
          </Link>
          <h1 className="mt-8 font-display text-3xl font-black">{verifying ? 'Check your email' : 'Owner sign in'}</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">{verifying ? 'Enter the private six-digit code we sent. It expires in 10 minutes.' : 'Manage products, stock, prices and scheduled offers securely.'}</p>
        </div>

        <div className="px-7 py-8 sm:px-9">
          {params.error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{params.error}</div>}
          {params.sent && !params.error && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">A one-time sign-in code was sent.</div>}

          {verifying ? (
            <form action={verifyCodeAction}>
              <input type="hidden" name="email" value={params.email} />
              <label htmlFor="admin-code" className="text-xs font-extrabold uppercase tracking-[.12em] text-gray-500">Six-digit code</label>
              <input id="admin-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} autoFocus required className="mt-2 h-14 w-full rounded-xl border border-gray-200 px-4 text-center font-display text-2xl font-black tracking-[.35em] outline-none focus:border-leaf-600 focus:ring-4 focus:ring-leaf-100" />
              <button type="submit" className="btn btn-primary mt-5 h-14 w-full rounded-xl">Verify and open dashboard</button>
            </form>
          ) : (
            <form action={requestCodeAction}>
              <label htmlFor="admin-email" className="text-xs font-extrabold uppercase tracking-[.12em] text-gray-500">Owner email</label>
              <input id="admin-email" name="email" type="email" autoComplete="email" defaultValue={params.email || ''} autoFocus required placeholder="you@leafsolar.ng" className="mt-2 h-14 w-full rounded-xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-leaf-600 focus:ring-4 focus:ring-leaf-100" />
              <button type="submit" className="btn btn-primary mt-5 h-14 w-full rounded-xl">Email my secure code</button>
            </form>
          )}

          {verifying && (
            <div className="mt-5 flex items-center justify-between gap-4 text-xs font-bold">
              <Link href="/admin/login" className="text-gray-500 hover:text-leaf-700">Use another email</Link>
              <form action={requestCodeAction}><input type="hidden" name="email" value={params.email} /><button className="text-leaf-700 hover:text-leaf-900">Send a new code</button></form>
            </div>
          )}
          <p className="mt-8 border-t border-gray-100 pt-5 text-center text-[11px] leading-5 text-gray-400">Passwordless access · One-time codes · Eight-hour secure session</p>
        </div>
      </div>
    </div>
  );
}
