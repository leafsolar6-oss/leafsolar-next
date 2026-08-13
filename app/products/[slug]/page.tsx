import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { products, formatNaira, whatsappUrl } from '@/lib/data';

export async function generateStaticParams() {
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [{ url: product.image, alt: product.imageAlt }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find(item => item.slug === slug);
  if (!product) return notFound();

  const related = products
    .filter(item => item.category === product.category && item.slug !== product.slug)
    .slice(0, 3);

  return (
    <>
      <section className="container-x py-10 md:py-14">
        <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/products" className="font-semibold text-leaf-700 hover:text-leaf-900">Products</Link>
          <span aria-hidden="true">/</span>
          <span>{product.category}</span>
        </nav>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#f5f6f2]">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-10 sm:p-14"
            />
            {product.badge && <span className="absolute left-5 top-5 rounded-full bg-gray-950 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">{product.badge}</span>}
          </div>

          <div className="lg:pt-5">
            <p className="eyebrow">{product.brand} · {product.category}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight md:text-5xl">{product.name}</h1>
            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-extrabold text-leaf-700">{formatNaira(product.price)}</span>
              {product.oldPrice && <span className="text-lg text-gray-400 line-through">{formatNaira(product.oldPrice)}</span>}
            </div>
            <p className="mt-7 text-lg leading-relaxed text-gray-600">{product.description}</p>

            <div className="mt-8 grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex gap-2"><span className="font-bold text-leaf-600">✓</span><span>Brand new and factory sealed</span></div>
              <div className="flex gap-2"><span className="font-bold text-leaf-600">✓</span><span>Manufacturer warranty</span></div>
              <div className="flex gap-2"><span className="font-bold text-leaf-600">✓</span><span>Fast delivery in Ibadan</span></div>
              <div className="flex gap-2"><span className="font-bold text-leaf-600">✓</span><span>Stock confirmed before payment</span></div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappUrl(`Hello Leaf Solar! I am interested in the ${product.name} listed at ${formatNaira(product.price)}.`)} className="btn btn-primary flex-1">Ask about this product</a>
              <Link href={`/contact?product=${encodeURIComponent(product.name)}`} className="btn btn-outline">Request a callback</Link>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">Prices and availability may change. Please confirm with our team before making payment.</p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-[#f5f6f2] py-16">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Keep browsing</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold">Related products</h2>
              </div>
              <Link href={`/products?c=${encodeURIComponent(product.category)}`} className="hidden text-sm font-bold text-leaf-700 sm:block">View category →</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(item => <ProductCard key={item.slug} product={item} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
