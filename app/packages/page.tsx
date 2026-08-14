import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { formatNaira } from '@/lib/data';
import { getProducts } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Solar Packages',
  description: 'Compare Leaf Solar tubular, lithium, commercial and industrial solar package starting points, subject to confirmed site design and written scope.',
  alternates: { canonical: '/packages' },
};

const groups = [
  { key: 'tubular', label: 'Tubular', category: 'Tubular Solar', description: 'Catalogue starting points built around tubular battery systems.', tone: 'bg-[#eef6e9]' },
  { key: 'lithium', label: 'Lithium', category: 'Lithium Solar', description: 'Catalogue starting points built around lithium battery systems.', tone: 'bg-[#edf4f8]' },
  { key: 'commercial', label: 'Commercial', category: 'Commercial Solar', description: 'Commercial package starting points that require confirmed load and site design.', tone: 'bg-[#f8f1e8]' },
  { key: 'industrial', label: 'Industrial', category: 'Industrial Solar', description: 'Industrial package starting points that require confirmed load and site design.', tone: 'bg-[#f4eeee]' },
];

export default async function Packages({ searchParams }: { searchParams: Promise<{ series?: string }> }) {
  const [{ series }, products] = await Promise.all([searchParams, getProducts()]);
  const packageProducts = products.filter(product => product.department === 'packages');
  const availableGroups = groups.filter(group => packageProducts.some(product => product.categoryLabel === group.category));
  const selectedSeries = availableGroups.some(item => item.key === series) ? series : undefined;
  const visibleGroups = availableGroups.filter(group => !selectedSeries || group.key === selectedSeries);
  return (
    <>
      <section className="relative overflow-hidden bg-leaf-900 text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 85% 10%, #5ebd7d 0, transparent 28%), radial-gradient(circle at 15% 100%, #facc15 0, transparent 22%)' }} />
        <div className="container-wide relative py-14 sm:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-200">{packageProducts.length} package starting points · Site review required</p><h1 className="mt-3 max-w-4xl font-display text-4xl font-black leading-[1.02] sm:text-6xl">Reliable power, sized for your home or business.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">Compare clearly priced package starting points. We confirm your load, site and final system design before installation.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/solar-calculator" className="btn bg-sun-400 text-gray-950 hover:bg-sun-500">Use solar calculator</Link><Link href="/contact" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">Request site assessment</Link></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/65"><span>✓ Load and site reviewed</span><span>✓ Written scope confirmed</span><span>✓ Project timing confirmed</span><span>✓ Product-specific warranty confirmed</span></div>
        </div>
      </section>

      <div className="sticky top-[7.85rem] z-30 border-b border-gray-100 bg-white/95 backdrop-blur lg:top-[9.85rem]">
        <nav className="container-wide scrollbar-none flex h-14 items-center gap-2 overflow-x-auto" aria-label="Solar package series"><Link href="/packages" className={`shrink-0 rounded-lg px-4 py-2 text-xs font-extrabold ${!selectedSeries ? 'bg-leaf-700 text-white' : 'bg-gray-100 text-gray-700'}`}>All packages</Link>{availableGroups.map(group => <Link key={group.key} href={`/packages?series=${group.key}`} className={`shrink-0 rounded-lg px-4 py-2 text-xs font-extrabold ${selectedSeries === group.key ? 'bg-leaf-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{group.label}</Link>)}</nav>
      </div>

      <section className="container-wide py-12 sm:py-16">
        <div className="space-y-16">
          {visibleGroups.map(group => {
            const list = packageProducts.filter(product => product.categoryLabel === group.category).sort((a, b) => a.price - b.price);
            return (
              <section key={group.key} id={group.key}>
                <div className={`flex flex-col justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-end sm:p-8 ${group.tone}`}><div><p className="text-xs font-black uppercase tracking-[.16em] text-leaf-700">{list.length} systems</p><h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{group.label} packages</h2><p className="mt-2 max-w-2xl text-sm text-gray-600">{group.description}</p></div><div className="shrink-0 sm:text-right"><span className="text-xs text-gray-500">Starting from</span><b className="block font-display text-2xl font-black text-leaf-700">{formatNaira(Math.min(...list.map(item => item.price)))}</b></div></div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{list.map(product => <ProductCard key={product.id} product={product} />)}</div>
              </section>
            );
          })}
        </div>

        <div className="mt-16 rounded-3xl bg-gray-950 p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-10 sm:p-10"><div><p className="text-xs font-black uppercase tracking-[.16em] text-sun-400">Need a custom configuration?</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">We design around your actual load.</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Final component choices depend on your appliance ratings, desired runtime, roof space, cable routes and distribution board.</p></div><Link href="/contact" className="btn mt-6 shrink-0 bg-white text-gray-950 hover:bg-gray-100 sm:mt-0">Talk to Leaf Solar</Link></div>
        <p className="mt-6 text-xs leading-relaxed text-gray-500">Published prices are catalogue starting points. The final written quotation confirms equipment, installation scope, delivery and any site-specific work.</p>
      </section>
    </>
  );
}
