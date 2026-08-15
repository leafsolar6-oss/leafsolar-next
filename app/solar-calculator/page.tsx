import type { Metadata } from 'next';
import Link from 'next/link';
import SolarCalculator from '@/components/SolarCalculator';
import { packagesFromProducts } from '@/lib/data';
import { getProducts } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Free Solar Load Calculator for Nigeria',
  description: 'Enter wattage and daily usage for each appliance, account for inverter models and starting surge, then compare indicative Leaf Solar package starting points.',
  alternates: { canonical: '/solar-calculator' },
  openGraph: { url: '/solar-calculator', type: 'website', title: 'Free Solar Load Calculator for Nigeria', description: 'Estimate running load, starting surge and daily energy from each appliance’s wattage and usage hours.', images: ['/leaf-solar-og.jpg'] },
};

export default async function SolarCalculatorPage() {
  const packages = packagesFromProducts(await getProducts());
  return (
    <>
      <section className="relative overflow-hidden bg-[#f4f1e8]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[50px] border-leaf-700/5" />
        <div className="container-wide relative py-12 sm:py-16">
          <nav className="mb-5 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/">Home</Link><span>/</span><span className="text-gray-900">Solar calculator</span></nav>
          <p className="eyebrow">Free solar sizing tool</p><h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-[1.04] sm:text-6xl">What do you want your solar system to power?</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">Choose your appliances, enter usage hours for each one, and account for inverter models and ×2–×4 starting surge before viewing an indicative system estimate.</p>
        </div>
      </section>
      <section className="container-wide py-9 sm:py-12"><SolarCalculator packages={packages} /></section>
    </>
  );
}
