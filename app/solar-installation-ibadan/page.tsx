import type { Metadata } from 'next';
import Link from 'next/link';
import { site, whatsappUrl } from '@/lib/data';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Solar Installation in Ibadan',
  description: 'Plan a solar installation in Ibadan with Leaf Solar: appliance-load review, site assessment, equipment selection, written quotation and project-specific installation scope.',
  alternates: { canonical: '/solar-installation-ibadan' },
  openGraph: { url: '/solar-installation-ibadan', type: 'website', title: 'Solar Installation in Ibadan', description: 'Plan an Ibadan solar project from appliance-load review and site information to a written, project-specific scope.', images: ['/leaf-solar-og.jpg'] },
};

const projectSteps = [
  { number: '01', title: 'Define the load', text: 'List the appliances, ratings, quantities, operating hours and loads that may run together. Separate essential from optional loads.' },
  { number: '02', title: 'Review the site', text: 'Share relevant site details, photographs or arrange an assessment when needed to review space, shading, routes, access and installation conditions.' },
  { number: '03', title: 'Confirm the scope', text: 'Review a written quotation identifying equipment, quantities, installation work, price and the assumptions that apply to the project.' },
  { number: '04', title: 'Install and hand over', text: 'Project timing is agreed for the specific scope. Handover should identify installed equipment and the operating, safety or maintenance guidance provided.' },
];

const considerations = [
  { title: 'Homes', text: 'Plan around essential household loads, desired backup time, daytime use and the appliances that need to start together.' },
  { title: 'Shops and offices', text: 'Document operating hours, work equipment, refrigeration, connectivity and any loads that affect business continuity.' },
  { title: 'Larger requirements', text: 'Commercial or industrial package names are only starting points; actual loads and site conditions must be confirmed.' },
];

export default function SolarInstallationIbadanPage() {
  const pageUrl = `${baseUrl}/solar-installation-ibadan`;
  const serviceStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${pageUrl}#service`,
    name: 'Solar installation planning and installation in Ibadan',
    serviceType: 'Solar system consultation and installation',
    description: 'Appliance-load review, site assessment, equipment selection, written project quotation and project-specific solar installation scope.',
    url: pageUrl,
    provider: { '@type': 'Store', '@id': `${baseUrl}/#store`, name: site.name },
    areaServed: { '@type': 'City', name: 'Ibadan' },
  };
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Solar installation in Ibadan', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceStructuredData).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c') }} />

      <section className="relative overflow-hidden bg-leaf-900 text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 90% 5%, #5ebd7d 0, transparent 30%), radial-gradient(circle at 5% 100%, #facc15 0, transparent 23%)' }} />
        <div className="container-x relative py-14 sm:py-20 lg:py-24">
          <nav className="flex items-center gap-2 text-xs font-semibold text-white/55" aria-label="Breadcrumb"><Link href="/" className="hover:text-white">Home</Link><span>/</span><span className="text-white/85">Solar installation in Ibadan</span></nav>
          <div className="mt-9 max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-sun-400">Ibadan solar planning &amp; installation</p>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">Solar installation designed around your actual load.</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-xl">Leaf Solar helps customers in Ibadan move from an appliance list and site details to a written, project-specific solar quotation. Calculator results and catalogue packages remain planning aids until the load, equipment and installation scope are confirmed.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/solar-calculator" className="btn bg-sun-400 text-gray-950 hover:bg-sun-500">Start with the load calculator</Link><Link href="/contact" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">Request a quotation</Link></div>
          </div>
        </div>
      </section>

      <main>
        <section className="container-x py-14 sm:py-20">
          <div className="max-w-3xl"><p className="eyebrow">A clear project path</p><h2 className="section-title mt-2">From appliance list to confirmed scope</h2><p className="mt-5 text-base leading-8 text-gray-600">A useful solar proposal explains what the system is intended to power, the equipment included and the site work covered. These steps keep that information visible.</p></div>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {projectSteps.map(item => <article key={item.number} className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8"><div className="flex items-start gap-5"><span className="font-display text-3xl font-black text-leaf-200">{item.number}</span><div><h3 className="font-display text-xl font-black text-gray-950 sm:text-2xl">{item.title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{item.text}</p></div></div></article>)}
          </div>
        </section>

        <section className="bg-[#f5f6f2] py-14 sm:py-20">
          <div className="container-x">
            <div className="grid gap-10 lg:grid-cols-[.86fr_1.14fr] lg:items-start">
              <div><p className="eyebrow">What the design considers</p><h2 className="section-title mt-2">Equipment choices follow the requirement.</h2><p className="mt-5 text-base leading-8 text-gray-600">Inverter output is only one part of the design. Daily energy, starting demand, battery storage, solar input, site conditions and electrical scope must work together.</p><Link href="/blog/how-to-size-solar-system-nigeria" className="mt-6 inline-flex text-sm font-extrabold text-leaf-700">Read the complete sizing guide →</Link></div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Appliance load', 'Actual ratings, quantities, hours and simultaneous use.'],
                  ['Battery storage', 'Desired backup period and product-specific operating limits.'],
                  ['Solar array', 'Equipment input limits, mounting space, orientation and shading.'],
                  ['Site scope', 'Cable routes, equipment location, access and distribution work.'],
                  ['Product fit', 'Confirmed inverter, battery, panel and protection compatibility.'],
                  ['Future use', 'Known load additions or expansion requirements discussed in advance.'],
                ].map(([term, detail]) => <div key={term} className="rounded-2xl bg-white p-5"><dt className="font-display text-lg font-black text-gray-950">{term}</dt><dd className="mt-2 text-sm leading-6 text-gray-600">{detail}</dd></div>)}
              </dl>
            </div>
          </div>
        </section>

        <section className="container-x py-14 sm:py-20">
          <div className="text-center"><p className="eyebrow">Different sites, specific loads</p><h2 className="section-title mt-2">Plan for how the property is actually used.</h2></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{considerations.map(item => <article key={item.title} className="rounded-3xl bg-leaf-900 p-7 text-white"><h3 className="font-display text-2xl font-black">{item.title}</h3><p className="mt-4 text-sm leading-7 text-white/65">{item.text}</p></article>)}</div>
        </section>

        <section className="bg-leaf-50 py-14 sm:py-20">
          <div className="container-x grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-start">
            <div><p className="eyebrow">Before you approve a project</p><h2 className="section-title mt-2">Ask for the details in writing.</h2><ul className="mt-7 space-y-4 text-sm leading-7 text-gray-700">{[
              'The equipment models and quantities included.',
              'The appliance loads and operating assumptions used for sizing.',
              'The installation, mounting, cable, protection and distribution work included.',
              'Any site, access or third-party-work assumptions.',
              'The project-specific timing and payment stages that apply.',
              'The product and workmanship warranty terms confirmed for that project.',
            ].map(item => <li key={item} className="grid grid-cols-[1.25rem_1fr] gap-3"><span className="mt-1 grid h-5 w-5 place-items-center rounded-full bg-leaf-700 text-[10px] font-black text-white">✓</span><span>{item}</span></li>)}</ul><Link href="/solar-installation-policy" className="mt-7 inline-flex text-sm font-extrabold text-leaf-700">Read the solar installation policy →</Link></div>
            <aside className="rounded-3xl bg-white p-7 shadow-[0_16px_45px_rgba(18,61,36,.08)] sm:p-9"><p className="text-xs font-black uppercase tracking-[.15em] text-leaf-700">Start your enquiry</p><h2 className="mt-3 font-display text-2xl font-black text-gray-950">Share your load and site information.</h2><p className="mt-4 text-sm leading-7 text-gray-600">Use the calculator for an early estimate or contact Leaf Solar directly. A final quotation is only confirmed after the relevant information has been reviewed.</p><div className="mt-6 grid gap-3"><Link href="/contact" className="btn btn-primary w-full rounded-xl">Request a project quotation</Link><a href={whatsappUrl('Hello Leaf Solar! I would like to discuss a solar installation in Ibadan.')} className="btn w-full rounded-xl border border-[#25D366]/25 bg-[#edfff3] text-[#167a38] hover:bg-[#e0fbea]">Ask on WhatsApp</a></div><address className="mt-6 border-t border-gray-100 pt-5 text-xs not-italic leading-6 text-gray-500">{site.address}<br />{site.phone}</address></aside>
          </div>
        </section>
      </main>
    </>
  );
}
