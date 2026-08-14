import Link from 'next/link';

export type PolicySection = { title: string; paragraphs?: string[]; bullets?: string[] };

export default function PolicyPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: PolicySection[] }) {
  return (
    <main>
      <section className="border-b border-gray-100 bg-[#f5f6f2]"><div className="container-wide py-10 sm:py-14"><nav className="mb-5 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/" className="hover:text-leaf-700">Home</Link><span>/</span><span className="text-gray-800">{title}</span></nav><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl">{title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">{intro}</p></div></section>
      <section className="container-wide py-10 sm:py-14"><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]"><article className="max-w-4xl space-y-8">{sections.map(section => <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-display text-xl font-black sm:text-2xl">{section.title}</h2>{section.paragraphs?.map(paragraph => <p key={paragraph} className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">{paragraph}</p>)}{section.bullets && <ul className="mt-4 space-y-3">{section.bullets.map(bullet => <li key={bullet} className="grid grid-cols-[20px_1fr] gap-2 text-sm leading-6 text-gray-600 sm:text-base"><span className="font-black text-leaf-700">•</span><span>{bullet}</span></li>)}</ul>}</section>)}</article><aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-5 lg:sticky lg:top-24"><p className="text-[10px] font-black uppercase tracking-[.14em] text-amber-800">Order-specific confirmation</p><p className="mt-3 text-sm leading-6 text-amber-950">This policy does not assume universal time limits, delivery dates, coverage, fees or remedies. Ask Leaf Solar to confirm any order-specific terms in writing before payment.</p><Link href="/contact" className="btn mt-5 w-full rounded-xl bg-amber-900 text-white">Contact Leaf Solar</Link></aside></div></section>
    </main>
  );
}
