import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getAdminProduct } from '@/lib/admin-data';
import { adjustInventoryAction, archiveProductAction } from '@/app/admin/(dashboard)/actions';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; stock?: string }>;
}) {
  const { id } = await params;
  const notices = await searchParams;
  const product = await getAdminProduct(Number(id));
  if (!product) notFound();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><Link href="/admin/products" className="text-xs font-extrabold text-gray-500 hover:text-leaf-700">← Back to products</Link><p className="mt-3 text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Product #{product.id}</p><h1 className="mt-1 max-w-4xl font-display text-3xl font-black sm:text-4xl">Edit product</h1><p className="mt-2 line-clamp-1 text-sm text-gray-500">{product.name}</p></div>
        {product.isActive && <Link href={`/products/${product.slug}`} target="_blank" className="btn rounded-xl border border-gray-200 bg-white text-gray-700">View in store ↗</Link>}
      </div>

      {(notices.saved || notices.created || notices.stock) && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notices.created ? 'Product added to the catalogue.' : notices.stock ? 'Stock quantity adjusted.' : 'Product changes saved.'}</div>}

      {product.trackInventory && (
        <section className="mt-6 rounded-2xl border border-leaf-200 bg-leaf-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.13em] text-leaf-700">Quick stock adjustment</p><h2 className="mt-1 font-display text-xl font-black">{product.stockQuantity || 0} units currently on hand</h2><p className="mt-1 text-xs text-gray-500">Add received stock with a positive number or record damage/corrections with a negative number.</p></div>
            <form action={adjustInventoryAction} className="grid gap-2 sm:grid-cols-[110px_minmax(220px,1fr)_auto]"><input type="hidden" name="productId" value={product.id} /><input name="changeQuantity" type="number" step="1" required placeholder="+ / −" className="h-11 rounded-xl border border-leaf-200 bg-white px-3 text-sm font-bold outline-none" /><input name="reason" required minLength={3} maxLength={160} placeholder="Reason, e.g. New delivery" className="h-11 rounded-xl border border-leaf-200 bg-white px-3 text-sm outline-none" /><button className="h-11 rounded-xl bg-leaf-800 px-5 text-xs font-extrabold text-white">Adjust stock</button></form>
          </div>
        </section>
      )}

      <div className="mt-6"><ProductForm product={product} /></div>

      {product.isActive && <details className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5"><summary className="cursor-pointer text-sm font-extrabold text-red-700">Remove this product from the storefront</summary><div className="mt-4 flex flex-col gap-4 border-t border-red-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-2xl text-xs leading-5 text-red-700/70">Archiving hides the product and prevents new purchases without deleting its history. You can republish it later from the product editor.</p><form action={archiveProductAction}><input type="hidden" name="productId" value={product.id} /><button className="rounded-xl bg-red-700 px-5 py-3 text-xs font-extrabold text-white">Archive product</button></form></div></details>}
    </div>
  );
}
