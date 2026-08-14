import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSolarGuide, solarGuides } from '@/lib/solar-guides';
import { site } from '@/lib/data';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

export function generateStaticParams() {
  return solarGuides.map(guide => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getSolarGuide((await params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/blog/${guide.slug}` },
    openGraph: {
      type: 'article',
      url: `/blog/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      publishedTime: guide.published,
      modifiedTime: guide.updated,
      authors: [site.name],
      images: ['/leaf-solar-og.jpg'],
    },
  };
}

export default async function SolarGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getSolarGuide((await params).slug);
  if (!guide) notFound();

  const guideUrl = `${baseUrl}/blog/${guide.slug}`;
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    image: `${baseUrl}/leaf-solar-og.jpg`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': guideUrl },
    author: { '@type': 'Organization', '@id': `${baseUrl}/#store`, name: site.name },
    publisher: { '@type': 'Organization', '@id': `${baseUrl}/#store`, name: site.name },
    inLanguage: 'en-NG',
  };
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Solar guides', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: guide.shortTitle, item: guideUrl },
    ],
  };
  const related = solarGuides.filter(item => item.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c') }} />

      <article>
        <header className="border-b border-gray-100 bg-[#f4f1e8]">
          <div className="container-x py-12 sm:py-16 lg:py-20">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-leaf-700">Home</Link><span>/</span>
              <Link href="/blog" className="hover:text-leaf-700">Solar guides</Link><span>/</span>
              <span className="text-gray-800">{guide.shortTitle}</span>
            </nav>
            <p className="eyebrow mt-8">{guide.eyebrow}</p>
            <h1 className="mt-3 max-w-5xl font-display text-4xl font-black leading-[1.04] text-gray-950 sm:text-6xl">{guide.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">{guide.description}</p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-gray-500">
              <span>By {site.name}</span><span>{guide.readTime}</span><time dateTime={guide.updated}>Updated 14 August 2026</time>
            </div>
          </div>
        </header>

        <div className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:py-20">
          <div className="max-w-3xl">
            <div className="space-y-5 text-lg leading-8 text-gray-700">
              {guide.introduction.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>

            <div className="mt-12 space-y-12">
              {guide.sections.map(section => (
                <section key={section.heading}>
                  <h2 className="font-display text-2xl font-black leading-tight text-gray-950 sm:text-3xl">{section.heading}</h2>
                  {section.paragraphs && <div className="mt-4 space-y-4 text-base leading-7 text-gray-600">{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>}
                  {section.bullets && <ul className="mt-5 space-y-3 text-base leading-7 text-gray-600">{section.bullets.map(item => <li key={item} className="grid grid-cols-[1rem_1fr] gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-leaf-600" /><span>{item}</span></li>)}</ul>}
                </section>
              ))}
            </div>

            <section className="mt-14 rounded-3xl bg-leaf-900 p-7 text-white sm:p-9">
              <p className="text-xs font-black uppercase tracking-[.16em] text-sun-400">Key takeaway</p>
              <p className="mt-4 text-lg leading-8 text-white/80">{guide.takeaway}</p>
            </section>

            <p className="mt-8 border-l-4 border-sun-400 pl-5 text-sm leading-7 text-gray-500">This educational guide supports early planning. A final solar-system design and quotation should use confirmed appliance information, product specifications and relevant site details.</p>
          </div>

          <aside className="lg:sticky lg:top-44 lg:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[.14em] text-leaf-700">Next steps</p>
              <nav className="mt-4 space-y-2" aria-label="Related actions">
                {guide.relatedLinks.map(item => <Link key={item.href} href={item.href} className="block rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold leading-5 text-gray-800 transition hover:bg-leaf-50 hover:text-leaf-800">{item.label} →</Link>)}
              </nav>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f4f1e8] p-5">
              <p className="text-xs font-black uppercase tracking-[.14em] text-amber-700">Need a project quote?</p>
              <p className="mt-3 text-sm leading-6 text-gray-600">Share your load and site information with Leaf Solar for review.</p>
              <Link href="/contact" className="btn btn-primary mt-4 w-full rounded-xl text-sm">Contact Leaf Solar</Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="bg-[#f5f6f2] py-12 sm:py-16">
        <div className="container-x">
          <div className="flex items-end justify-between gap-5"><div><p className="eyebrow">Keep learning</p><h2 className="section-title mt-2">Related solar guides</h2></div><Link href="/blog" className="hidden text-sm font-extrabold text-leaf-700 sm:block">View all guides →</Link></div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">{related.map(item => <Link key={item.slug} href={`/blog/${item.slug}`} className="group rounded-2xl border border-gray-100 bg-white p-6 transition hover:-translate-y-1 hover:border-leaf-200 hover:shadow-lg"><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">{item.eyebrow}</p><h3 className="mt-3 font-display text-xl font-black leading-tight group-hover:text-leaf-700">{item.shortTitle}</h3><p className="mt-3 text-sm leading-6 text-gray-500">{item.description}</p><span className="mt-5 inline-flex text-sm font-extrabold text-leaf-700">Read guide →</span></Link>)}</div>
        </div>
      </section>
    </>
  );
}
