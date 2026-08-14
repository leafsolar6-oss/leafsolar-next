import { site, whatsappUrl } from '@/lib/data';

export const metadata = {
  title: 'About Leaf Solar in Ibadan',
  description: 'Meet Leaf Solar & Electronics, a registered Nigerian solar and home-appliance company and authorized dealer based in Ibadan.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', type: 'website', title: 'About Leaf Solar in Ibadan', description: 'Learn about Leaf Solar solar planning, equipment and home-appliance retail in Ibadan.', images: ['/leaf-solar-og.jpg'] },
};

const values = [
  { title: 'Product-specific details', description: 'Specifications and warranty terms are shown only when confirmed for the product; otherwise, customers are asked to confirm them before purchase.' },
  { title: 'Clear recommendations', description: 'Solar planning starts with the customer’s load and site needs before the final system and scope are confirmed.' },
  { title: 'Written solar scope', description: 'Equipment, protection, installation work and after-sales arrangements apply only where they are identified in the project quotation.' },
  { title: 'Managed delivery', description: 'Delivery is free within Ibadan; destinations outside Ibadan receive an owner-approved quote before payment.' },
];

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#10261a] text-white">
        <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="container-x relative py-16 md:py-24">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-300">About Leaf Solar</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-tight md:text-6xl">One company for better power and better living.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">Leaf Solar &amp; Electronics is a registered Nigerian business and Fouani Authorized Dealer based in Ibadan. We catalogue appliances and solar equipment and prepare project-specific solar quotations for homes and businesses.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">{site.rcNumber}</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Fouani Authorized Dealer</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Based in Ibadan</span>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-20 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="section-title mt-3">Built to remove the uncertainty from buying power equipment.</h2>
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-gray-600">
          <p>Leaf Solar brings appliance shopping and solar planning into one catalogue, while keeping product-specific specifications, warranty terms and project scope subject to confirmation.</p>
          <p>Our electronics catalogue includes TVs, refrigerators, air conditioners, washers, kitchen appliances and more. The solar range includes inverters, batteries, panels and package starting points for homes and larger commercial projects.</p>
          <p>Whether you are replacing an appliance or planning a solar project, the Leaf Solar team can discuss the options and confirm the details that apply to the product, delivery address or installation scope.</p>
        </div>
      </section>

      <section className="bg-[#f5f6f2] py-20">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow">What guides us</p>
            <h2 className="section-title mt-3">Trust is part of the product.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {values.map((value, index) => (
              <div key={value.title} className="rounded-3xl border border-gray-100 bg-white p-7">
                <span className="text-xs font-bold text-leaf-700">0{index + 1}</span>
                <h3 className="mt-4 font-display text-xl font-bold">{value.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid gap-8 rounded-[2rem] bg-leaf-700 p-8 text-white md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Visit us in Ibadan</h2>
            <p className="mt-3 max-w-2xl text-white/75">{site.address}.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a href="https://maps.google.com/?q=DP+Plaza,+Akala+Express,+Ibadan" className="btn bg-white text-leaf-700 hover:bg-gray-100">Open map</a>
            <a href={whatsappUrl()} className="btn border border-white/25 text-white hover:bg-white/10">Message us</a>
          </div>
        </div>
      </section>
    </>
  );
}
