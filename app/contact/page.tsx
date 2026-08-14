import ContactForm from './ContactForm';
import { packagesFromProducts, site, whatsappUrl } from '@/lib/data';
import { getProducts } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact Leaf Solar in Ibadan',
  description: 'Contact Leaf Solar in Ibadan for product enquiries, solar project quotations, site-assessment information, delivery and customer support.',
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', type: 'website', title: 'Contact Leaf Solar in Ibadan', description: 'Contact Leaf Solar for product enquiries, solar project quotations, delivery information and support.', images: ['/leaf-solar-og.jpg'] },
};

export default async function Contact({ searchParams }: { searchParams: Promise<{ pkg?: string; product?: string }> }) {
  const [{ pkg, product }, catalogue] = await Promise.all([searchParams, getProducts()]);
  const packages = packagesFromProducts(catalogue);
  return (
    <>
      <section className="border-b border-gray-100 bg-[#f5f6f2]">
        <div className="container-x py-14 md:py-20">
          <p className="eyebrow">Talk to a real person</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold md:text-5xl">Questions, product enquiries or a solar project quotation?</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">Contact Leaf Solar by WhatsApp, phone, email or the enquiry form.</p>
        </div>
      </section>

      <section className="container-x grid gap-12 py-14 lg:grid-cols-[.8fr_1.2fr] lg:py-20">
        <div>
          <h2 className="font-display text-2xl font-bold">Contact details</h2>
          <div className="mt-7 space-y-4">
            <a href={whatsappUrl()} className="group block rounded-2xl border border-gray-100 p-5 transition hover:border-leaf-200 hover:bg-leaf-50">
              <p className="text-xs font-bold uppercase tracking-wider text-leaf-700">WhatsApp</p>
              <p className="mt-1 text-lg font-bold text-gray-950 group-hover:text-leaf-700">{site.phone}</p>
            </a>
            <a href={`tel:${site.phoneHref}`} className="group block rounded-2xl border border-gray-100 p-5 transition hover:border-leaf-200 hover:bg-leaf-50">
              <p className="text-xs font-bold uppercase tracking-wider text-leaf-700">Phone</p>
              <p className="mt-1 text-lg font-bold text-gray-950 group-hover:text-leaf-700">{site.phone}</p>
            </a>
            <a href={`mailto:${site.email}`} className="group block rounded-2xl border border-gray-100 p-5 transition hover:border-leaf-200 hover:bg-leaf-50">
              <p className="text-xs font-bold uppercase tracking-wider text-leaf-700">Email</p>
              <p className="mt-1 font-bold text-gray-950 group-hover:text-leaf-700">{site.email}</p>
            </a>
          </div>

          <div className="mt-8 rounded-2xl bg-gray-950 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-300">Visit the shop</p>
            <p className="mt-3 leading-relaxed text-white/75">{site.address}.</p>
            <a href="https://maps.google.com/?q=DP+Plaza,+Akala+Express,+Ibadan" className="mt-4 inline-flex text-sm font-bold text-white hover:text-leaf-300">Open in Google Maps →</a>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-500">Delivery is free within Ibadan. Destinations outside Ibadan require a confirmed quote before online payment; timing is arranged for each order.</p>
        </div>

        <div>
          <ContactForm initialPkg={pkg || ''} initialProduct={product || ''} packages={packages} />
        </div>
      </section>
    </>
  );
}
