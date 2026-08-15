import type { MerchantAuditSummary } from '@/lib/merchant-api';
import { latestMerchantAudit } from '@/lib/merchant-audit-store';
import { refreshMerchantAudit } from './actions';

export const dynamic = 'force-dynamic';

function badge(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes('approved') && !normalized.includes('not')) return 'bg-emerald-100 text-emerald-800';
  if (normalized.includes('eligible')) return 'bg-emerald-100 text-emerald-800';
  if (normalized.includes('not approved') || normalized.includes('disapproved') || normalized.includes('failed')) return 'bg-red-100 text-red-800';
  if (normalized.includes('pending') || normalized.includes('limited') || normalized.includes('demoted')) return 'bg-amber-100 text-amber-900';
  return 'bg-gray-100 text-gray-700';
}

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.13em] text-gray-400">{label}</p><b className="mt-2 block font-display text-3xl font-black text-gray-950">{value}</b>{note && <p className="mt-1 text-xs text-gray-500">{note}</p>}</div>;
}

export default async function MerchantPage() {
  const record = await latestMerchantAudit();
  const success = record?.status === 'success' ? record.summary as MerchantAuditSummary : null;
  const failure = record?.status === 'failed' ? record.summary as { generatedAt: string; error: string } : null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Google sales channel</p>
          <h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Merchant Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">Protected API audit of accounts, sources, uploads, processed products and Google diagnostics. This screen does not delete products or sources.</p>
        </div>
        <form action={refreshMerchantAudit}><button className="btn btn-primary rounded-xl" type="submit">Run read-only audit</button></form>
      </div>

      {!record && <section className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-display text-xl font-black text-amber-950">No audit recorded yet</h2><p className="mt-2 text-sm text-amber-900">Run a protected read-only audit to retrieve the latest Merchant API state.</p></section>}

      {failure && <section className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-black text-red-950">Audit could not complete</h2><span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase text-red-800">Sanitized failure</span></div><p className="mt-3 text-sm text-red-900">{failure.error}</p><p className="mt-3 text-xs text-red-700">No Merchant products, sources or settings were changed.</p></section>}

      {success && <>
        <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-display text-xl font-black">{success.accountName}</h2><p className="mt-1 text-xs text-gray-400">Account {success.accountId} · audited {new Date(success.generatedAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-800">API connected</span><span className="rounded-full bg-sky-100 px-3 py-1.5 text-[10px] font-black uppercase text-sky-800">{success.registration.status.replaceAll('_', ' ')}</span><span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black uppercase text-gray-700">0 destructive changes</span></div></div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Processed products" value={success.totals.processedProducts} note={`${success.totals.sourceCountedProducts} assigned to known sources`} />
          <Metric label="Reporting rows" value={success.totals.reportingRows ?? 'Unavailable'} note="Merchant product_view" />
          <Metric label="Data sources" value={success.totals.configuredDataSources} note={`${success.totals.productsWithoutKnownSource} products outside known sources`} />
          <Metric label="Products disapproved" value={success.totals.productsWithDisapprovals} note={`${success.totals.productsApprovedSomewhere} approved in at least one country/context`} />
        </div>

        <section className="mt-5 grid gap-4 xl:grid-cols-2">
          <article className={`rounded-2xl border p-5 ${success.businessInfo?.addressConfigured ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-black">Business address</h2><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${success.businessInfo?.addressConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{success.businessInfo?.addressConfigured ? 'Configured' : 'Incomplete'}</span></div>{success.businessInfo ? <p className="mt-2 text-xs leading-5 opacity-75">{[...success.businessInfo.addressLines, success.businessInfo.locality, success.businessInfo.administrativeArea, success.businessInfo.postalCode, success.businessInfo.regionCode].filter(Boolean).join(', ') || 'No address fields returned.'}</p> : <p className="mt-2 text-xs opacity-75">Business information was not available to this audit.</p>}</article>
          <article className="rounded-2xl border border-gray-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-lg font-black">Shipping settings</h2><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-black uppercase text-gray-700">Read only</span></div>{success.shippingSettings ? <div className="mt-3 space-y-2">{success.shippingSettings.services.length ? success.shippingSettings.services.map((service, index) => <div key={`${service.serviceName}-${index}`} className="rounded-xl bg-gray-50 p-3 text-xs"><b>{service.serviceName}</b><p className="mt-1 text-gray-500">{service.active ? 'Active' : 'Inactive'} · {service.deliveryCountries.join(', ') || 'No country'} · {service.currencyCode || 'No currency'} · {service.rateGroupCount} rate group(s){service.flatRates.length ? ` · flat rates ${service.flatRates.map(rate => `${Number(rate.amountMicros) / 1_000_000} ${rate.currencyCode || ''}`.trim()).join(', ')}` : ''}</p></div>) : <p className="text-xs text-gray-500">No shipping services were returned.</p>}<p className="text-[11px] text-gray-400">{success.shippingSettings.warehouses} warehouse record(s)</p></div> : <p className="mt-2 text-xs text-gray-500">Shipping settings were not available to this audit.</p>}</article>
        </section>

        <section className={`mt-5 rounded-2xl border p-5 ${success.protectedFeed.healthyExpectedCount ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.13em] opacity-60">Protected source</p><h2 className="mt-1 font-display text-xl font-black">Leafsolar product feed</h2></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${success.protectedFeed.healthyExpectedCount ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{success.protectedFeed.productCount} products</span></div>
          <p className="mt-2 text-sm opacity-75">{success.protectedFeed.healthyExpectedCount ? 'The API confirms the expected 114 processed products. This source remains protected from deletion.' : 'The source does not currently match the expected healthy 114-product state; no automatic correction was made.'}</p>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4"><h2 className="font-display text-xl font-black">Data sources</h2><p className="mt-1 text-xs text-gray-400">API ownership counts and latest file-processing evidence</p></div>
          <div className="divide-y divide-gray-100">{success.dataSources.map(source => <article key={source.resourceName || source.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-gray-950">{source.displayName}</h3><p className="mt-1 text-xs text-gray-400">{source.type.replaceAll('_', ' ')} · {source.input.replaceAll('_', ' ')} · source {source.id}</p></div><b className="font-display text-2xl text-leaf-800">{source.productCount}</b></div>{source.fetch?.uri && <p className="mt-2 break-all text-xs text-gray-500">{source.fetch.uri}</p>}{source.latestUpload ? <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-600"><b className="text-gray-900">Latest upload: {source.latestUpload.state.replaceAll('_', ' ')}</b><span className="ml-2">{source.latestUpload.itemsTotal ?? '—'} processed · {source.latestUpload.itemsCreated ?? '—'} created · {source.latestUpload.itemsUpdated ?? '—'} updated</span>{source.latestUpload.uploadedAt && <span className="ml-2">· {new Date(source.latestUpload.uploadedAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}</span>}{source.latestUpload.issues.length > 0 && <ul className="mt-2 list-disc pl-4">{source.latestUpload.issues.map((issue, index) => <li key={`${issue.title}-${index}`}>{issue.title} ({issue.severity}){issue.count === null ? '' : ` · ${issue.count}`}</li>)}</ul>}</div> : <p className="mt-2 text-xs text-gray-400">No latest file-upload resource applies or is available.</p>}</article>)}</div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-black">Manual category entries</h2><p className="mt-1 text-xs text-gray-400">API lookup tolerates accidental leading punctuation; no deletion performed</p><div className="mt-4 space-y-3">{success.manualEntries.map(entry => <article key={entry.expectedTitle} className="rounded-xl bg-gray-50 p-4"><div className="flex items-start justify-between gap-3"><div><b className="text-sm">{entry.expectedTitle}</b><p className="mt-1 break-all text-[11px] text-gray-400">{entry.found ? `${entry.offerId || 'No offer ID'} · ${entry.dataSource || 'Unknown source'}${entry.actualTitle && entry.actualTitle !== entry.expectedTitle ? ` · actual title: ${entry.actualTitle}` : ''}` : 'No matching processed product found'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${badge(entry.status)}`}>{entry.status}</span></div>{entry.issues.length > 0 && <ul className="mt-2 list-disc pl-4 text-xs text-gray-600">{entry.issues.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.description} · {issue.severity}</li>)}</ul>}</article>)}</div></section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-black">120-item reconciliation</h2><p className="mt-1 text-xs text-gray-400">Compared with the previously observed Sales channels total</p><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-gray-50 p-3"><b className="font-display text-2xl">120</b><p className="text-[10px] text-gray-400">UI observed</p></div><div className="rounded-xl bg-gray-50 p-3"><b className="font-display text-2xl">{success.salesChannelReconciliation.processedProductCount}</b><p className="text-[10px] text-gray-400">API products</p></div><div className="rounded-xl bg-gray-50 p-3"><b className="font-display text-2xl">{success.salesChannelReconciliation.reportingRowCount ?? '—'}</b><p className="text-[10px] text-gray-400">Report rows</p></div></div><p className="mt-4 text-sm text-gray-600">{success.salesChannelReconciliation.note}</p><span className={`mt-4 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase ${success.salesChannelReconciliation.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{success.salesChannelReconciliation.resolved ? 'Reconciled' : 'Needs exact evidence'}</span><div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600"><b>PRODUCTS SOURCE 4:</b> {success.emptyProductSource4.found ? `${success.emptyProductSource4.productCount} API-owned products` : 'absent from the current API data-source list'}</div></section>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-xl font-black">Product diagnostics</h2><p className="mt-1 text-xs text-gray-400">{success.totals.productsWithIssues} products across {success.totals.productIssueGroups} issue groups</p></div></div>{success.productIssues.length ? <div className="mt-4 space-y-3">{success.productIssues.map((issue, issueIndex) => <details key={`${issue.code}-${issueIndex}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4"><summary className="cursor-pointer list-none"><div className="flex items-start justify-between gap-3"><div><b className="text-sm">{issue.description}</b><p className="mt-1 text-[11px] text-gray-400">{issue.code}{issue.attribute ? ` · ${issue.attribute}` : ''} · {issue.reportingContexts.join(', ')}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${badge(issue.severity)}`}>{issue.affectedProducts} · {issue.severity}</span></div></summary><div className="mt-3 divide-y divide-gray-200 text-xs">{issue.products.map((product, index) => <div key={`${product.offerId}-${index}`} className="py-2"><b>{product.title || product.offerId}</b><span className="ml-2 text-gray-400">{product.countries.join(', ') || 'No country listed'}</span></div>)}</div></details>)}</div> : <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No product-level issues were returned.</p>}</section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-black">Account diagnostics</h2>{success.accountIssues.length ? <div className="mt-4 space-y-3">{success.accountIssues.map((issue, index) => <article key={`${issue.title}-${index}`} className="rounded-xl bg-gray-50 p-4"><div className="flex items-start justify-between gap-3"><b className="text-sm">{issue.title}</b><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${badge(issue.severity)}`}>{issue.severity}</span></div>{issue.detail && <p className="mt-2 text-xs text-gray-600">{issue.detail}</p>}</article>)}</div> : <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No account-level issues were returned.</p>}{success.warnings.length > 0 && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-xs text-amber-900"><b>Audit warnings</b><ul className="mt-2 list-disc pl-4">{success.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div>}</section>
      </>}
    </div>
  );
}
