import { site, whatsappUrl } from '@/lib/data';

export const metadata = {
  title: 'About Us',
  description: 'Meet Leaf Solar & Electronics, a registered Nigerian solar and home-appliance company and authorized dealer based in Ibadan.',
};

const values = [
  { title: 'Genuine only', description: 'We supply original, factory-sealed products from trusted manufacturers, backed by the applicable manufacturer warranty.' },
  { title: 'Clear recommendations', description: 'We start with what you need to power, then recommend a practical system instead of pushing the biggest package.' },
  { title: 'Complete service', description: 'Solar design, equipment, protection, installation and after-sales guidance are handled by one accountable team.' },
  { title: 'Fast local delivery', description: 'We serve customers from our Ibadan shop and arrange same-day or next-day local delivery where available.' },
];

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#10261a] text-white">
        <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full border-[70px] border-white/5" />
        <div className="container-x relative py-16 md:py-24">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-300">About Leaf Solar</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-extrabold leading-tight md:text-6xl">One company for better power and better living.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">Leaf Solar &amp; Electronics is a registered Nigerian business and Fouani Authorized Dealer based in Ibadan. We supply genuine appliances and deliver complete solar solutions for homes and businesses.</p>
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
          <p>Leaf Solar started with a straightforward mission: help customers avoid fake products, unclear specifications and unreliable fulfilment. Every item we sell is selected around authenticity, useful warranty cover and dependable service.</p>
          <p>Our electronics catalogue includes TVs, refrigerators, air conditioners, washers, kitchen appliances and more. Our solar team supplies inverters, batteries, panels and complete installed packages—from home essentials to larger commercial systems.</p>
          <p>Whether you are replacing an appliance or planning a solar installation, you deal with real people who can explain the options clearly and stay accountable after delivery.</p>
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
