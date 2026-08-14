'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatNaira, type SolarPackage, whatsappUrl } from '@/lib/data';

type Appliance = { id: string; name: string; watts: number; quantity: number; note?: string };
const defaults: Appliance[] = [
  { id: 'lights', name: 'Light bulbs', watts: 10, quantity: 0 },
  { id: 'ceiling-fan', name: 'Ceiling fan', watts: 45, quantity: 0, note: 'Inverter model' },
  { id: 'tv', name: 'Television', watts: 100, quantity: 0 },
  { id: 'fridge', name: 'Fridge / freezer', watts: 180, quantity: 0, note: 'Inverter model' },
  { id: 'ac', name: 'Air conditioner', watts: 1100, quantity: 0, note: '1HP inverter' },
  { id: 'router', name: 'Decoder / router', watts: 25, quantity: 0 },
  { id: 'laptop', name: 'Laptop / phones', watts: 75, quantity: 0 },
  { id: 'sound', name: 'Sound system', watts: 120, quantity: 0 },
  { id: 'standing-fan', name: 'Standing fan', watts: 55, quantity: 0 },
  { id: 'microwave', name: 'Microwave', watts: 1200, quantity: 0 },
  { id: 'pump', name: 'Water pump', watts: 1000, quantity: 0 },
  { id: 'washer', name: 'Washing machine', watts: 500, quantity: 0 },
];

const initials: Record<string, string> = { lights:'LB','ceiling-fan':'CF',tv:'TV',fridge:'FR',ac:'AC',router:'DR',laptop:'LP',sound:'SS','standing-fan':'SF',microwave:'MW',pump:'WP',washer:'WM' };

export default function SolarCalculator({ packages }: { packages: SolarPackage[] }) {
  const [appliances, setAppliances] = useState(defaults);
  const [hours, setHours] = useState(6);
  const [showCustom, setShowCustom] = useState(false);

  const estimate = useMemo(() => {
    const runningWatts = appliances.reduce((sum, item) => sum + item.watts * item.quantity, 0);
    const dailyKwh = runningWatts * hours / 1000;
    const requiredKva = runningWatts * 1.35 / 800;
    const inverter = [1.5, 1.7, 2.5, 3.5, 5, 10, 15, 20, 30].find(size => size >= requiredKva) || 30;
    const batteryKwh = dailyKwh * 1.25;
    const solarKw = dailyKwh / (4.5 * .78);
    const recommended = packages.find(item => {
      const kva = Number(item.name.match(/([\d.]+)KVA/i)?.[1] || 0);
      return kva >= inverter;
    }) || packages[packages.length - 1] || null;
    return { runningWatts, dailyKwh, inverter, batteryKwh, solarKw, recommended };
  }, [appliances, hours, packages]);

  function update(id: string, changes: Partial<Appliance>) { setAppliances(current => current.map(item => item.id === id ? { ...item, ...changes } : item)); }
  function addCustom(form: FormData) {
    const name = String(form.get('name') || 'Custom appliance').trim();
    const watts = Math.max(1, Number(form.get('watts') || 100));
    setAppliances(current => [...current, { id: `custom-${Date.now()}`, name, watts, quantity: 1 }]); setShowCustom(false);
  }

  const summary = appliances.filter(item => item.quantity > 0).map(item => `${item.quantity}× ${item.name} (${item.watts}W)`).join(', ');

  return (
    <div className="grid gap-7 lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><span className="text-xs font-black text-leaf-700">1</span><h2 className="mt-1 font-display text-2xl font-black">Choose your appliances</h2></div><button onClick={() => setAppliances(defaults)} className="text-xs font-bold text-gray-400 hover:text-leaf-700">Reset</button></div>
        <details className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-950"><summary className="cursor-pointer font-bold">How do I find the wattage?</summary><p className="mt-2 leading-relaxed text-amber-900/70">Check the sticker or nameplate, usually at the back or bottom. It shows a number followed by W or Watts. For ACs and motors, use rated input watts—not horsepower.</p></details>
        <div className="mt-5 divide-y divide-gray-100">
          {appliances.map(item => (
            <div key={item.id} className="grid grid-cols-[44px_1fr] items-center gap-3 py-3 sm:grid-cols-[44px_1fr_95px_116px]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-50 text-[10px] font-black text-leaf-700">{initials[item.id] || 'AP'}</span>
              <div><b className="block text-sm">{item.name}</b>{item.note && <small className="text-[10px] text-gray-400">{item.note}</small>}</div>
              <label className="col-start-2 row-start-2 flex items-center gap-2 text-[10px] font-bold text-gray-400 sm:col-start-3 sm:row-start-auto"><input type="number" min="1" max="10000" value={item.watts} onChange={event => update(item.id, { watts: Number(event.target.value) })} className="h-9 w-16 rounded-lg border border-gray-200 px-2 text-right text-xs font-bold text-gray-700 outline-none focus:border-leaf-600"/> W</label>
              <div className="col-start-2 row-start-3 inline-flex h-10 w-[116px] items-center overflow-hidden rounded-lg border border-gray-200 sm:col-start-4 sm:row-start-auto"><button onClick={() => update(item.id, { quantity: Math.max(0, item.quantity - 1) })} className="h-full w-10 text-lg hover:bg-gray-50">−</button><span className="grid h-full w-9 place-items-center border-x border-gray-200 text-xs font-black">{item.quantity}</span><button onClick={() => update(item.id, { quantity: Math.min(20, item.quantity + 1) })} className="h-full w-10 text-lg hover:bg-gray-50">+</button></div>
            </div>
          ))}
        </div>
        {showCustom ? (
          <form action={addCustom} className="mt-4 grid gap-3 rounded-xl border border-leaf-200 bg-leaf-50/40 p-4 sm:grid-cols-[1fr_110px_auto]"><input required name="name" placeholder="Appliance name" className="h-11 rounded-lg border border-gray-200 px-3 text-sm"/><input required name="watts" type="number" min="1" placeholder="Watts" className="h-11 rounded-lg border border-gray-200 px-3 text-sm"/><button className="btn btn-primary h-11 px-4 text-sm">Add</button></form>
        ) : <button onClick={() => setShowCustom(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-bold text-leaf-700 hover:border-leaf-600">+ Add a custom appliance</button>}

        <div className="mt-8 border-t border-gray-100 pt-7"><div className="flex items-center justify-between"><span className="text-sm font-bold">Average use per day</span><b className="rounded-lg bg-leaf-50 px-3 py-1.5 text-sm text-leaf-700">{hours} hours</b></div><input type="range" min="1" max="18" value={hours} onChange={event => setHours(Number(event.target.value))} className="mt-5 w-full accent-green-700"/><div className="mt-1 flex justify-between text-[10px] font-bold text-gray-400"><span>1h</span><span>18h+</span></div></div>
      </div>

      <aside className="h-fit rounded-3xl bg-leaf-900 p-5 text-white lg:sticky lg:top-40 sm:p-8">
        <span className="text-xs font-black text-leaf-200">2</span><h2 className="mt-1 font-display text-2xl font-black">Your instant estimate</h2>
        {estimate.runningWatts === 0 ? (
          <div className="py-16 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></div><p className="mt-5 text-sm leading-relaxed text-white/60">Tap + next to an appliance. Your estimated system size and package will appear here.</p></div>
        ) : (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-2">
              <Result label="Running load" value={`${estimate.runningWatts.toLocaleString()} W`} />
              <Result label="Daily energy" value={`${estimate.dailyKwh.toFixed(1)} kWh`} />
              <Result label="Suggested inverter" value={`${estimate.inverter} kVA`} />
              <Result label="Battery target" value={`${estimate.batteryKwh.toFixed(1)} kWh`} />
              <Result label="Solar array" value={`${Math.max(.5, estimate.solarKw).toFixed(1)} kW`} wide />
            </div>
            {estimate.recommended ? <div className="mt-5 rounded-2xl bg-sun-400 p-5 text-gray-950"><p className="text-[10px] font-black uppercase tracking-[.15em]">Recommended starting point</p><h3 className="mt-2 font-display text-xl font-black leading-tight">{estimate.recommended.name}</h3><p className="mt-2 text-2xl font-black">{formatNaira(estimate.recommended.price)}</p><Link href={`/products/${estimate.recommended.slug}`} className="mt-4 inline-flex text-sm font-black">View package →</Link></div> : <div className="mt-5 rounded-2xl bg-white/10 p-5"><p className="text-sm font-bold">No published package currently matches this estimate.</p><p className="mt-2 text-xs leading-relaxed text-white/60">Send the load summary to Leaf Solar for a project-specific review.</p></div>}
            <a href={whatsappUrl(`Hello Leaf Solar! I used the calculator. My appliances: ${summary}. Estimated running load: ${estimate.runningWatts}W, about ${estimate.dailyKwh.toFixed(1)}kWh daily. Please confirm the right system.`)} className="btn mt-4 w-full bg-white text-leaf-900 hover:bg-gray-100">Get my free quote</a>
          </div>
        )}
        <p className="mt-6 text-[10px] leading-relaxed text-white/45">This estimate is indicative. Final design depends on actual appliance ratings, usage, surge loads, roof space and a site assessment.</p>
      </aside>
    </div>
  );
}

function Result({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`${wide ? 'col-span-2' : ''} rounded-xl bg-white/10 p-4`}><span className="block text-[9px] font-bold uppercase tracking-wider text-white/45">{label}</span><b className="mt-1 block font-display text-xl">{value}</b></div>;
}
