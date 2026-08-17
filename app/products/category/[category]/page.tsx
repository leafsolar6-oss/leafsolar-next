import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/catalog-store';
import { activeCategories } from '@/lib/categories';

// Cached at the edge; refreshed from the database at most once a minute,
// and purged instantly by the admin refreshStore() hook.
export const revalidate = 60;

export async function generateStaticParams() {
  const categories = activeCategories(await getProducts());
  return categories.map((category) => ({ category: category.slug }));
}

export const dynamicParams = true;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

function departmentIntro(label: string, department: 'electronics' | 'solar' | 'packages', count: number) {
  const listed = `${count} ${count === 1 ? 'listing' : 'listings'}`;
  if (department === 'packages') {
    return `Compare the ${listed} in the ${label} starting-point range. Each project is reviewed against the intended load, product limits and site details, and confirmed in a written scope before installation.`;
  }
  if (department === 'solar') {
    return `Browse the ${listed} for ${label.toLowerCase()} in the Leaf Solar catalogue. Component choices are reviewed against your load, compatibility and site information as part of a confirmed system design.`;
  }
  return `Browse the ${listed} for ${label.toLowerCase()} in the Leaf Solar catalogue. Open any product for its current price, availability and product-specific specifications. Free delivery within Ibadan; owner-approved quotes elsewhere.`;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const match = activeCategories(await getProducts()).find((item) => item.slug === category);
  if (!match) return {};
  const title = `${match.label} in Ibadan | Leaf Solar`;
  const description = `Shop ${match.label.toLowerCase()} from Leaf Solar in Ibadan. ${match.count} current ${match.count === 1 ? 'listing' : 'listings'} with prices and availability. Free delivery within Ibadan; owner-approved delivery quotes elsewhere.`;
  return {
    title,
    description,
    alternates: { canonical: `/products/category/${match.slug}` },
    openGraph: {
      url: `/products/category/${match.slug}`,
      type: 'website',
      title,
      description,
      images: ['/leaf-solar-og.jpg'],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const products = await getProducts();
  const categories = activeCategories(products);
  const current = categories.find((item) => item.slug === category);
  if (!current) return notFound();

  const items = products.filter((product) => product.categoryLabel === current.label);
  const pageUrl = `${baseUrl}/products/category/${current.slug}`;
  const relatedLanding =
    current.department === 'packages'
      ? { href: '/packages', label: 'Compare all solar packages' }
      : current.department === 'solar'
        ? { href: '/solar-products', label: 'Browse all solar equipment' }
        : { href: '/home-appliances-ibadan', label: 'Browse all home appliances' };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: `${current.label} in Ibadan`,
    description: `Leaf Solar catalogue listings for ${current.label.toLowerCase()}.`,
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', name: 'Leaf Solar', url: baseUrl },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${baseUrl}/products` },
        { '@type': 'ListItem', position: 3, name: current.label, item: pageUrl },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${baseUrl}/products/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="border-b border-gray-100 bg-[#f5f6f2]">
        <div className="container-wide py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-leaf-700">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-leaf-700">Shop</Link>
            <span>/</span>
            <span className="text-gray-800">{current.label}</span>
          </nav>
          <p className="eyebrow">{items.length} {items.length === 1 ? 'listing' : 'listings'} · Updated regularly</p>
          <h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl">{current.label} in Ibadan</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">{departmentIntro(current.label, current.department, items.length)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className="btn bg-leaf-700 text-white hover:bg-leaf-800 text-sm">Browse the full catalogue</Link>
            <Link href={relatedLanding.href} className="btn border border-gray-200 bg-white text-sm hover:border-leaf-300">{relatedLanding.label}</Link>
          </div>
        </div>
      </section>

      <section className="container-wide py-9 sm:py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-[#f5f6f2] py-8">
        <div className="container-wide">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-gray-500">Shop other categories</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories
              .filter((item) => item.slug !== current.slug)
              .slice(0, 12)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/category/${item.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-leaf-300 hover:text-leaf-700"
                >
                  {item.label} · {item.count}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
