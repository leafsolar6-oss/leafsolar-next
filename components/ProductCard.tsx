import Image from 'next/image';
import Link from 'next/link';
import { formatNaira, productBadge, type Product } from '@/lib/data';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { QuickViewButton } from '@/components/quickview/QuickViewProvider';

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const badge = productBadge(product);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:border-leaf-200 hover:shadow-[0_16px_40px_rgba(15,61,31,.10)]">
      <div className="relative aspect-square overflow-hidden bg-[#f8f9f7]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-4 transition duration-500 group-hover:scale-[1.04] sm:p-6"
          />
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {badge && <span className="rounded-md bg-leaf-700 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white sm:text-[10px]">{badge}</span>}
          {discount > 0 && <span className="rounded-md bg-sun-400 px-2 py-1 text-[9px] font-black text-gray-950 sm:text-[10px]">-{discount}%</span>}
        </div>
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
          <QuickViewButton product={product} />
          <div className="hidden sm:block"><AddToCartButton product={product} compact /></div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="truncate text-[9px] font-extrabold uppercase tracking-[.13em] text-leaf-700 sm:text-[10px]">{product.brand} · {product.categoryLabel}</p>
        <Link href={`/products/${product.slug}`} className="mt-1.5 line-clamp-2 min-h-10 font-display text-[15px] font-bold leading-snug text-gray-950 transition hover:text-leaf-700 sm:min-h-12 sm:text-base">
          {product.name}
        </Link>
        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-display text-base font-black text-gray-950 sm:text-xl">{formatNaira(product.price)}</span>
            {product.oldPrice && <span className="text-[10px] text-gray-400 line-through sm:text-xs">{formatNaira(product.oldPrice)}</span>}
          </div>
          <div className="mt-3 sm:hidden">
            <AddToCartButton product={product} className="w-full px-2 py-2 text-xs" />
          </div>
        </div>
      </div>
    </article>
  );
}
