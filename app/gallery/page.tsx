import type { Metadata } from 'next';
import Link from 'next/link';
import GalleryGrid from '@/components/GalleryGrid';
import { getGallerySlides } from '@/lib/gallery-store';

// Cached at the edge; refreshed from the Blob store at most once a minute,
// and purged instantly by the admin gallery/carousel actions.
export const revalidate = 60;

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Solar Installation Gallery in Ibadan | Leaf Solar',
  description: 'See photos of completed Leaf Solar projects: rooftop solar arrays, commercial installations, inverters, battery systems and equipment delivery in Ibadan and around Oyo State.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    url: '/gallery',
    type: 'website',
    title: 'Solar Installation Gallery in Ibadan | Leaf Solar',
    description: 'Photos of completed Leaf Solar installations, equipment and delivery in Ibadan.',
    images: ['/leaf-solar-og.jpg'],
  },
};

export default async function GalleryPage() {
  const photos = await getGallerySlides();
  const pageUrl = `${baseUrl}/gallery`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: 'Leaf Solar installation gallery',
    description: 'Photos of completed Leaf Solar installations, equipment and delivery in Ibadan.',
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', name: 'Leaf Solar', url: baseUrl },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: photos.length,
      itemListElement: photos.map((photo, index) => ({ '@type': 'ListItem', position: index + 1, image: photo.src })),
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
            <span className="text-gray-800">Gallery</span>
          </nav>
          <p className="eyebrow">{photos.length} {photos.length === 1 ? 'photo' : 'photos'} · Real Leaf Solar projects</p>
          <h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl">Our work, on rooftops across Ibadan.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Completed solar arrays, commercial installations, battery and inverter systems, and equipment delivery by the Leaf Solar team. Every project is reviewed against the intended load and site details, and confirmed in a written scope before installation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/solar-installation-ibadan" className="btn bg-leaf-700 text-white hover:bg-leaf-800 text-sm">Plan an installation</Link>
            <Link href="/packages" className="btn border border-gray-200 bg-white text-sm hover:border-leaf-300">Compare solar packages</Link>
          </div>
        </div>
      </section>

      <section className="container-wide py-9 sm:py-12">
        <GalleryGrid photos={photos} />
      </section>

      <section className="border-t border-gray-100 bg-[#f5f6f2] py-8">
        <div className="container-wide flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm leading-6 text-gray-600">Planning a solar project? See what goes into a properly sized system before you choose equipment.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/solar-calculator" className="btn border border-gray-200 bg-white text-sm hover:border-leaf-300">Free sizing calculator</Link>
            <Link href="/blog/how-to-size-solar-system-nigeria" className="btn border border-gray-200 bg-white text-sm hover:border-leaf-300">Read the sizing guide</Link>
          </div>
        </div>
      </section>
    </>
  );
}
