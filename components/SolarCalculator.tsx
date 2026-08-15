'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatNaira, type SolarPackage, whatsappUrl } from '@/lib/data';
import {
  calculateSolarLoad,
  defaultCalculatorAppliances,
  type CalculatorAppliance,
  type SurgeMultiplier,
} from '@/lib/solar-calculator';

const initials: Record<string, string> = {
  lights: 'LB',
  'ceiling-fan': 'CF',
  tv: 'TV',
  fridge: 'FR',
  ac: 'AC',
  router: 'DR',
  laptop: 'LP',
  sound: 'SS',
  'standing-fan': 'SF',
  microwave: 'MW',
  pump: 'WP',
  washer: 'WM',
};

function freshDefaults() {
  return defaultCalculatorAppliances.map(item => ({ ...item }));
}

function clamp(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}

export default function SolarCalculator({ packages }: { packages: SolarPackage[] }) {
  const [appliances, setAppliances] = useState<CalculatorAppliance[]>(freshDefaults);
  const [showCustom, setShowCustom] = useState(false);

  const estimate = useMemo(() => {
    const load = calculateSolarLoad(appliances);
    const recommended = packages.find(item => {
      const kva = Number(item.name.match(/([\d.]+)KVA/i)?.[1] || 0);
      return kva >= load.inverter;
    }) || packages[packages.length - 1] || null;
    return { ...load, recommended };
  }, [appliances, packages]);

  function update(id: string, changes: Partial<CalculatorAppliance>) {
    setAppliances(current => current.map(item => item.id === id ? { ...item, ...changes } : item));
  }

  function setInverter(id: string, inverter: boolean) {
    setAppliances(current => current.map(item => item.id === id
      ? {
          ...item,
          inverter,
          surgeMultiplier: inverter ? 1 : item.nonInverterSurge,
        }
      : item));
  }

  function setSurge(id: string, surgeMultiplier: SurgeMultiplier) {
    setAppliances(current => current.map(item => item.id === id
      ? {
          ...item,
          surgeMultiplier,
          nonInverterSurge: item.inverter ? item.nonInverterSurge : surgeMultiplier,
        }
      : item));
  }

  function addCustom(form: FormData) {
    const name = String(form.get('name') || '').trim() || 'Custom appliance';
    const watts = clamp(Number(form.get('watts')), 1, 100_000);
    const hoursPerDay = clamp(Number(form.get('hours')), 0, 24);
    const requestedSurge = clamp(Number(form.get('surge')), 1, 4) as SurgeMultiplier;
    const inverter = form.get('inverter') === 'on';
    setAppliances(current => [
      ...current,
      {
        id: `custom-${Date.now()}`,
        name,
        watts,
        quantity: 1,
        hoursPerDay,
        inverter,
        surgeMultiplier: inverter ? 1 : requestedSurge,
        nonInverterSurge: requestedSurge,
        supportsInverter: true,
        custom: true,
      },
    ]);
    setShowCustom(false);
  }

  const summary = estimate.active.map(item => {
    const applianceType = item.supportsInverter ? (item.inverter ? 'inverter' : 'non-inverter') : 'standard';
    return `${item.quantity}× ${item.name} (${item.watts}W, ${item.hoursPerDay}h/day, ${applianceType}, ×${item.surgeMultiplier} start)`;
  }).join(', ');

  return (
    <div className="grid gap-7 lg:grid-cols-[1.18fr_.82fr]">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div><span className="text-xs font-black text-leaf-700">1</span><h2 className="mt-1 font-display text-2xl font-black">Choose your appliances</h2></div>
          <button type="button" onClick={() => setAppliances(freshDefaults())} className="text-xs font-bold text-gray-400 hover:text-leaf-700">Reset</button>
        </div>

        <details className="mt-5 rounded-xl bg-amber-50 p-4 text-xs text-amber-950">
          <summary className="cursor-pointer font-bold">Wattage, usage time and starting surge</summary>
          <div className="mt-2 space-y-2 leading-relaxed text-amber-900/75">
            <p>Use the rated input watts on each appliance nameplate. Enter daily active/runtime hours against that appliance—not one shared figure for the whole list.</p>
            <p>Motor and compressor loads can briefly need more power when starting. The ×2, ×3 and ×4 presets are cautious estimates. Select the actual manufacturer starting value when it is available.</p>
            <p>The inverter-appliance switch preselects ×1 for a soft-start/inverter-driven model. You can still change the multiplier if its documentation gives a higher starting requirement.</p>
          </div>
        </details>

        <div className="mt-5 space-y-3">
          {appliances.map(item => (
            <article key={item.id} className={`rounded-2xl border p-4 transition ${item.quantity > 0 ? 'border-leaf-300 bg-leaf-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-leaf-50 text-[10px] font-black text-leaf-700">{initials[item.id] || 'AP'}</span>
                <div>
                  <b className="block text-sm">{item.name}</b>
                  {item.note && <small className="text-[10px] text-gray-400">{item.note}</small>}
                </div>
                {item.custom && <button type="button" onClick={() => setAppliances(current => current.filter(currentItem => currentItem.id !== item.id))} className="text-[10px] font-bold text-gray-400 hover:text-red-600">Remove</button>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                <Control label="Rated watts">
                  <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-2">
                    <input aria-label={`${item.name} rated watts`} type="number" min="1" max="100000" value={item.watts || ''} onChange={event => update(item.id, { watts: clamp(Number(event.target.value), 0, 100_000) })} className="min-w-0 flex-1 bg-transparent text-right text-xs font-bold text-gray-700 outline-none" />
                    <span className="ml-1 text-[10px] font-bold text-gray-400">W</span>
                  </div>
                </Control>

                <Control label="Quantity">
                  <div className="inline-flex h-10 w-full items-center justify-between overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <button type="button" aria-label={`Reduce ${item.name} quantity`} onClick={() => update(item.id, { quantity: Math.max(0, item.quantity - 1) })} className="h-full w-10 text-lg hover:bg-gray-50">−</button>
                    <span className="grid h-full min-w-8 place-items-center border-x border-gray-200 px-2 text-xs font-black">{item.quantity}</span>
                    <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => update(item.id, { quantity: Math.min(20, item.quantity + 1) })} className="h-full w-10 text-lg hover:bg-gray-50">+</button>
                  </div>
                </Control>

                <Control label="Hours / day">
                  <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-2">
                    <input aria-label={`${item.name} usage hours per day`} type="number" min="0" max="24" step="0.5" value={item.hoursPerDay || ''} placeholder="0" onChange={event => update(item.id, { hoursPerDay: clamp(Number(event.target.value), 0, 24) })} className="min-w-0 flex-1 bg-transparent text-right text-xs font-bold text-gray-700 outline-none" />
                    <span className="ml-1 text-[10px] font-bold text-gray-400">h</span>
                  </div>
                </Control>

                <Control label="Inverter appliance">
                  {item.supportsInverter ? (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.inverter}
                      aria-label={`${item.name} is an inverter appliance`}
                      onClick={() => setInverter(item.id, !item.inverter)}
                      className={`flex h-10 w-full items-center justify-between rounded-lg border px-2 text-[10px] font-black transition ${item.inverter ? 'border-leaf-600 bg-leaf-700 text-white' : 'border-gray-200 bg-white text-gray-500'}`}
                    >
                      <span>{item.inverter ? 'Yes' : 'No'}</span>
                      <span className={`relative h-5 w-9 rounded-full ${item.inverter ? 'bg-white/30' : 'bg-gray-200'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${item.inverter ? 'left-[18px]' : 'left-0.5'}`} /></span>
                    </button>
                  ) : <div className="grid h-10 place-items-center rounded-lg border border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-400">Not applicable</div>}
                </Control>

                <Control label="Starting surge">
                  <select aria-label={`${item.name} starting surge multiplier`} value={item.surgeMultiplier} onChange={event => setSurge(item.id, Number(event.target.value) as SurgeMultiplier)} className="h-10 w-full rounded-lg border border-gray-200 bg-white px-2 text-xs font-black text-gray-700 outline-none focus:border-leaf-600">
                    <option value={1}>×1 — none</option>
                    <option value={2}>×2</option>
                    <option value={3}>×3</option>
                    <option value={4}>×4</option>
                  </select>
                </Control>
              </div>
            </article>
          ))}
        </div>

        {showCustom ? (
          <form action={addCustom} className="mt-4 rounded-2xl border border-leaf-200 bg-leaf-50/40 p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-[10px] font-black uppercase tracking-wide text-gray-500 sm:col-span-2"><span className="mb-1.5 block">Appliance name</span><input required name="name" placeholder="e.g. Chest freezer" className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium normal-case tracking-normal" /></label>
              <label className="text-[10px] font-black uppercase tracking-wide text-gray-500"><span className="mb-1.5 block">Rated watts</span><input required name="watts" type="number" min="1" max="100000" placeholder="Watts" className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium normal-case tracking-normal" /></label>
              <label className="text-[10px] font-black uppercase tracking-wide text-gray-500"><span className="mb-1.5 block">Hours / day</span><input required name="hours" type="number" min="0" max="24" step="0.5" placeholder="0–24" className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium normal-case tracking-normal" /></label>
              <label className="text-[10px] font-black uppercase tracking-wide text-gray-500"><span className="mb-1.5 block">Starting surge</span><select name="surge" defaultValue="1" className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold normal-case tracking-normal"><option value="1">×1 — none</option><option value="2">×2</option><option value="3">×3</option><option value="4">×4</option></select></label>
              <label className="flex h-11 items-center gap-2 self-end rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700"><input name="inverter" type="checkbox" className="h-4 w-4 accent-green-700" /> Inverter appliance</label>
              <div className="flex items-end gap-2 sm:col-span-2"><button type="submit" className="btn btn-primary h-11 flex-1 px-4 text-sm">Add appliance</button><button type="button" onClick={() => setShowCustom(false)} className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-xs font-bold text-gray-500">Cancel</button></div>
            </div>
          </form>
        ) : <button type="button" onClick={() => setShowCustom(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-bold text-leaf-700 hover:border-leaf-600">+ Add a custom appliance</button>}
      </div>

      <aside className="h-fit rounded-3xl bg-leaf-900 p-5 text-white lg:sticky lg:top-40 sm:p-8">
        <span className="text-xs font-black text-leaf-200">2</span><h2 className="mt-1 font-display text-2xl font-black">Your instant estimate</h2>
        {estimate.runningWatts === 0 ? (
          <div className="py-16 text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></div><p className="mt-5 text-sm leading-relaxed text-white/60">Tap + next to an appliance, then enter its own hours per day. No load or usage figure is assumed before you make a selection.</p></div>
        ) : (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-2">
              <Result label="Running load" value={`${Math.round(estimate.runningWatts).toLocaleString()} W`} />
              <Result label="Peak start load" value={`${Math.round(estimate.peakStartingWatts).toLocaleString()} W`} />
              <Result label="Daily energy" value={`${estimate.dailyKwh.toFixed(2)} kWh`} />
              <Result label="Suggested inverter" value={`${estimate.inverter} kVA`} />
              <Result label="Battery target" value={`${estimate.batteryKwh.toFixed(2)} kWh`} />
              <Result label="Solar array" value={`${estimate.solarKw.toFixed(2)} kW`} />
            </div>

            {estimate.missingUsageHours.length > 0 && <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-xs leading-relaxed text-amber-100"><b>Usage time required:</b> enter hours/day for {estimate.missingUsageHours.join(', ')} before relying on the battery, solar-array or package estimate.</div>}

            {estimate.usageComplete && estimate.recommended ? <div className="mt-5 rounded-2xl bg-sun-400 p-5 text-gray-950"><p className="text-[10px] font-black uppercase tracking-[.15em]">Recommended starting point</p><h3 className="mt-2 font-display text-xl font-black leading-tight">{estimate.recommended.name}</h3><p className="mt-2 text-2xl font-black">{formatNaira(estimate.recommended.price)}</p><Link href={`/products/${estimate.recommended.slug}`} className="mt-4 inline-flex text-sm font-black">View package →</Link></div> : estimate.usageComplete ? <div className="mt-5 rounded-2xl bg-white/10 p-5"><p className="text-sm font-bold">No published package currently matches this estimate.</p><p className="mt-2 text-xs leading-relaxed text-white/60">Send the load summary to Leaf Solar for a project-specific review.</p></div> : null}

            <a href={whatsappUrl(`Hello Leaf Solar! I used the calculator. My appliances: ${summary}. Estimated running load: ${Math.round(estimate.runningWatts)}W; peak starting load: ${Math.round(estimate.peakStartingWatts)}W; about ${estimate.dailyKwh.toFixed(2)}kWh daily. Please confirm the right system.`)} className="btn mt-4 w-full bg-white text-leaf-900 hover:bg-gray-100">Get my free quote</a>
          </div>
        )}
        <p className="mt-6 text-[10px] leading-relaxed text-white/45">Starting load uses the largest selected appliance-group surge while the other loads are running. Actual simultaneous starts, nameplate current, power factor, roof space and site conditions can change the final design. Leaf Solar must confirm the system before purchase.</p>
      </aside>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><span className="mb-1.5 block text-[9px] font-black uppercase tracking-wide text-gray-400">{label}</span>{children}</div>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 p-4"><span className="block text-[9px] font-bold uppercase tracking-wider text-white/45">{label}</span><b className="mt-1 block font-display text-xl">{value}</b></div>;
}
