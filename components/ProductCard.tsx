import Image from 'next/image';
import Link from 'next/link';
import { formatNaira, Product } from '@/lib/data';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-leaf-100 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-[#f7f7f5]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-7 transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-gray-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-leaf-700">
          {product.brand} · {product.category}
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-gray-950 group-hover:text-leaf-700">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="text-xl font-extrabold text-gray-950">{formatNaira(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">{formatNaira(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
