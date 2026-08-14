import Image from 'next/image';
import Link from 'next/link';
import { getAdminProducts } from '@/lib/admin-data';
import { formatNaira } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({ searchParams }: {
  searchParams: Promise<{ q?: string; filter?: string; archived?: string }>;
}) {
  const params = await searchParams;
  const all = await getAdminProducts();
  const query = (params.q || '').trim().toLowerCase();
  const filter = params.filter || 'active';
  const products = all.filter(product => {
    const matchesQuery = !query || `${product.name} ${product.sku} ${product.brand} ${product.categoryLabel}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all'
      || (filter === 'active' && product.isActive)
      || (filter === 'archived' && !product.isActive)
      || (filter === 'tracked' && product.trackInventory)
      || (filter === 'attention' && product.isActive && (product.trackInventory ? (product.stockQuantity || 0) <= (product.lowStockThreshold || 0) : !product.manualInStock));
    return matchesQuery && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Catalogue</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Products</h1><p className="mt-2 text-sm text-gray-500">{all.filter(product => product.isActive).length} active products · {all.filter(product => product.trackInventory).length} quantity-tracked</p></div>
        <Link href="/admin/products/new" className="btn btn-primary rounded-xl">+ Add new product</Link>
      </div>
      {params.archived && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Product removed from the storefront.</div>}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1"><svg className="absolute left-3.5 top-3.5 text-gray-400" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input name="q" defaultValue={params.q} placeholder="Search name, SKU, brand or category" className="h-12 w-full rounded-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" /></div>
          <select name="filter" defaultValue={filter} className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold outline-none"><option value="active">Active products</option><option value="all">All products</option><option value="tracked">Quantity tracked</option><option value="attention">Needs attention</option><option value="archived">Archived</option></select>
          <button className="h-12 rounded-xl bg-gray-900 px-6 text-sm font-extrabold text-white">Apply</button>
        </form>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(320px,1.5fr)_130px_140px_130px_80px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-[10px] font-black uppercase tracking-[.11em] text-gray-400 lg:grid"><span>Product</span><span>Price</span><span>Inventory</span><span>Status</span><span></span></div>
        <div className="divide-y divide-gray-100">
          {products.map(product => {
            const available = product.trackInventory ? (product.stockQuantity || 0) > 0 : product.manualInStock;
            const low = product.trackInventory && (product.stockQuantity || 0) <= (product.lowStockThreshold || 0);
            return <div key={product.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(320px,1.5fr)_130px_140px_130px_80px] lg:items-center lg:gap-4 lg:px-5">
              <div className="grid min-w-0 grid-cols-[64px_1fr] items-center gap-3"><span className="relative aspect-square overflow-hidden rounded-xl bg-[#f5f6f2]"><Image src={product.imageUrl} alt="" fill sizes="64px" className="object-contain p-2" /></span><span className="min-w-0"><Link href={`/admin/products/${product.id}`} className="line-clamp-2 text-sm font-extrabold hover:text-leaf-700">{product.name}</Link><small className="mt-1 block truncate text-gray-400">{product.sku || 'No SKU'} · {product.categoryLabel}</small></span></div>
              <div><b className="text-sm text-leaf-800">{formatNaira(product.effectivePrice)}</b>{product.activeOfferId && <small className="block text-[10px] font-bold text-amber-600">Offer active</small>}</div>
              <div>{product.trackInventory ? <><b className={low ? 'text-amber-700' : 'text-gray-800'}>{product.stockQuantity || 0} units</b><small className="block text-[10px] text-gray-400">Low at {product.lowStockThreshold || 0}</small></> : <><b className="text-xs">Flexible stock</b><small className="block text-[10px] text-gray-400">Manual availability</small></>}</div>
              <div className="flex flex-wrap gap-1.5"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{product.isActive ? 'PUBLISHED' : 'ARCHIVED'}</span><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${available ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'}`}>{available ? 'IN STOCK' : 'OUT'}</span></div>
              <Link href={`/admin/products/${product.id}`} className="rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-extrabold text-gray-600 hover:border-leaf-300 hover:text-leaf-700">Edit</Link>
            </div>;
          })}
          {!products.length && <div className="px-5 py-16 text-center"><h2 className="font-display text-xl font-black">No matching products</h2><p className="mt-2 text-sm text-gray-400">Change the search or product filter.</p></div>}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">Showing {products.length} of {all.length} products</p>
    </div>
  );
}
