import Link from 'next/link';
import { whatsappUrl } from '@/lib/data';

export const metadata = {
  title: 'Solar Guides',
  description: 'Practical guidance from Leaf Solar on choosing solar packages, inverters, batteries and panels in Nigeria.',
};

const guides = [
  { number: '01', title: 'How to size solar for a Nigerian home', description: 'Start with the appliances you actually use, their wattage and how many hours you need them to run—not just the number of rooms.' },
  { number: '02', title: 'Lithium or tubular battery?', description: 'Compare upfront budget, expected usage, available space, maintenance and long-term replacement cost before deciding.' },
  { number: '03', title: 'What an installation quote should include', description: 'A good quote accounts for panels, mounting, protection, cable runs, changeover, labour, testing and after-sales support.' },
];

const questions = [
  { question: 'Can I add more panels or batteries later?', answer: 'Often, yes—but expansion must stay within the inverter, charge controller and battery manufacturer limits. Tell us your future plans during sizing.' },
  { question: 'Will solar power my air conditioner?', answer: 'Yes, when the inverter, battery and solar array are sized for the AC’s running power, startup behaviour and the number of hours you expect to use it.' },
  { question: 'Do I need a site assessment?', answer: 'It is recommended for installed packages. It helps confirm your load, cable routes, panel space, shading and distribution-board requirements before the final quote.' },
];

export default function Blog() {
  return (
    <>
      <section className="bg-[#10261a] text-white">
        <div className="container-x py-16 md:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-300">Solar knowledge</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold md:text-6xl">Make a confident power decision.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">Clear, practical guidance for choosing and using solar equipment in Nigerian homes and businesses.</p>
        </div>
      </section>

      <section className="container-x py-16 md:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Start with the basics</p>
            <h2 className="section-title mt-2">Three things every buyer should know</h2>
          </div>
          <span className="hidden rounded-full bg-leaf-50 px-4 py-2 text-xs font-bold text-leaf-700 sm:block">Full guides coming soon</span>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {guides.map(guide => (
            <article key={guide.number} className="rounded-3xl border border-gray-100 p-7">
              <span className="text-xs font-extrabold text-leaf-700">{guide.number}</span>
              <h2 className="mt-7 font-display text-xl font-bold leading-snug">{guide.title}</h2>
              <p className="mt-3 leading-relaxed text-gray-600">{guide.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f6f2] py-16 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="eyebrow">Common questions</p>
            <h2 className="section-title mt-2">Quick answers before you buy</h2>
          </div>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {questions.map(item => (
              <div key={item.question} className="py-6">
                <h3 className="font-display text-lg font-bold">{item.question}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 md:py-20">
        <div className="rounded-3xl bg-leaf-700 p-8 text-center text-white md:p-12">
          <h2 className="font-display text-3xl font-extrabold">Have a specific question?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">Send us your appliance list or current power challenge and our team will help you identify a sensible next step.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={whatsappUrl('Hello Leaf Solar! I have a question about choosing a solar system.')} className="btn bg-white text-leaf-700 hover:bg-gray-100">Ask on WhatsApp</a>
            <Link href="/contact" className="btn border border-white/25 text-white hover:bg-white/10">Contact form</Link>
          </div>
        </div>
      </section>
    </>
  );
}
