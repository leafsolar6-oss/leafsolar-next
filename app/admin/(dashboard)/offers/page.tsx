import Image from 'next/image';
import { createOfferAction, endOfferAction, toggleOfferAction } from '@/app/admin/(dashboard)/actions';
import { getAdminOffers, getAdminProducts } from '@/lib/admin-data';
import { formatNaira } from '@/lib/data';

export const dynamic = 'force-dynamic';

function lagosInput(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Africa/Lagos', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date).replace(' ', 'T');
}

export default async function AdminOffersPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const params = await searchParams;
  const [products, offers] = await Promise.all([getAdminProducts(), getAdminOffers()]);
  const activeProducts = products.filter(product => product.isActive);
  const input = 'h-12 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100';
  const statusTone = { Current: 'bg-emerald-100 text-emerald-700', Scheduled: 'bg-sky-100 text-sky-700', Ended: 'bg-gray-100 text-gray-500', Paused: 'bg-amber-100 text-amber-700' };

  return (
    <div>
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Promotions</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Scheduled offers</h1><p className="mt-2 text-sm text-gray-500">Launch temporary sale prices automatically and feature selected deals on the homepage.</p></div>
      {params.created && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Offer created and scheduled successfully.</div>}

      <section className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sun-400 font-display text-xl font-black">%</span><div><h2 className="font-display text-xl font-black">Create an offer</h2><p className="text-xs text-gray-400">Times use Lagos time (WAT).</p></div></div>
        <form action={createOfferAction} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="md:col-span-2"><span className="mb-2 block text-[10px] font-black uppercase tracking-[.1em] text-gray-500">Product</span><select name="productId" required className={input} defaultValue=""><option value="" disabled>Choose a product</option>{activeProducts.map(product => <option key={product.id} value={product.id}>{product.name} — {formatNaira(product.basePrice)}</option>)}</select></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.1em] text-gray-500">Offer name</span><input name="title" required maxLength={100} className={input} placeholder="Weekend TV deal" /></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.1em] text-gray-500">Badge text</span><input name="badge" defaultValue="Sale" required maxLength={30} className={input} placeholder="Flash deal" /></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.1em] text-gray-500">Sale price</span><div className="relative"><span className="absolute left-3.5 top-3 text-sm font-black text-gray-400">₦</span><input name="salePrice" type="number" min="1" step="1" required className={`${input} pl-8`} /></div></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.1em] text-gray-500">Starts</span><input name="startsAt" type="datetime-local" defaultValue={lagosInput()} required className={input} /></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.1em] text-gray-500">Ends <i className="normal-case text-gray-400">(optional)</i></span><input name="endsAt" type="datetime-local" className={input} /></label>
          <div className="flex items-end"><label className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl bg-leaf-50 px-4"><input name="featured" type="checkbox" className="h-5 w-5 accent-leaf-700" /><span className="text-xs font-extrabold text-leaf-900">Feature on homepage</span></label></div>
          <button className="h-12 rounded-xl bg-leaf-800 px-6 text-sm font-extrabold text-white md:col-span-2 xl:col-span-4 xl:justify-self-end">Create scheduled offer</button>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4"><h2 className="font-display text-xl font-black">All offers</h2><p className="mt-1 text-xs text-gray-400">{offers.filter(offer => offer.status === 'Current').length} live · {offers.filter(offer => offer.status === 'Scheduled').length} scheduled</p></div>
        <div className="divide-y divide-gray-100">
          {offers.map(offer => <article key={offer.id} className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(300px,1fr)_160px_170px_auto] md:items-center md:px-5">
            <div className="grid min-w-0 grid-cols-[58px_1fr] items-center gap-3"><span className="relative aspect-square overflow-hidden rounded-xl bg-gray-50"><Image src={offer.productImage} alt="" fill sizes="58px" className="object-contain p-1.5" /></span><span className="min-w-0"><b className="block truncate text-sm">{offer.productName}</b><small className="mt-1 block text-gray-400">{offer.title} · Badge: {offer.badge}</small></span></div>
            <div><b className="text-leaf-800">{formatNaira(offer.salePrice)}</b><small className="block text-[10px] text-gray-400 line-through">{formatNaira(offer.basePrice)}</small></div>
            <div><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${statusTone[offer.status]}`}>{offer.status.toUpperCase()}</span>{offer.featured && <span className="ml-1.5 rounded-full bg-sun-100 px-2.5 py-1 text-[9px] font-black text-amber-800">FEATURED</span>}<small className="mt-2 block text-[10px] leading-4 text-gray-400">{new Date(offer.startsAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}{offer.endsAt ? ` → ${new Date(offer.endsAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}` : ' → No end date'}</small></div>
            <div className="flex gap-2 md:justify-end"><form action={toggleOfferAction}><input type="hidden" name="offerId" value={offer.id} /><button className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-extrabold text-gray-600">{offer.isActive ? 'Pause' : 'Resume'}</button></form>{offer.status !== 'Ended' && <form action={endOfferAction}><input type="hidden" name="offerId" value={offer.id} /><button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-extrabold text-red-600">End</button></form>}</div>
          </article>)}
          {!offers.length && <p className="px-5 py-16 text-center text-sm text-gray-400">No offers have been created yet.</p>}
        </div>
      </section>
    </div>
  );
}
