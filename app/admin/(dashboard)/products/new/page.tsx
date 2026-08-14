import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <Link href="/admin/products" className="text-xs font-extrabold text-gray-500 hover:text-leaf-700">← Back to products</Link>
      <div className="mb-7 mt-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Catalogue</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Add a new product</h1><p className="mt-2 text-sm text-gray-500">Create the listing, set its price and choose how inventory is tracked.</p></div>
      <ProductForm />
    </div>
  );
}
