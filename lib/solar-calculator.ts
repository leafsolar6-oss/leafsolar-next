export type SurgeMultiplier = 1 | 2 | 3 | 4;

export type CalculatorAppliance = {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  inverter: boolean;
  surgeMultiplier: SurgeMultiplier;
  nonInverterSurge: SurgeMultiplier;
  supportsInverter: boolean;
  note?: string;
  custom?: boolean;
};

export const defaultCalculatorAppliances: CalculatorAppliance[] = [
  { id: 'lights', name: 'Light bulbs', watts: 10, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 1, nonInverterSurge: 1, supportsInverter: false, note: 'Typical LED bulb' },
  { id: 'ceiling-fan', name: 'Ceiling fan', watts: 45, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 2, nonInverterSurge: 2, supportsInverter: true },
  { id: 'tv', name: 'Television', watts: 100, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 1, nonInverterSurge: 1, supportsInverter: false },
  { id: 'fridge', name: 'Fridge / freezer', watts: 180, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 4, nonInverterSurge: 4, supportsInverter: true, note: 'Compressor load' },
  { id: 'ac', name: 'Air conditioner', watts: 1100, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 3, nonInverterSurge: 3, supportsInverter: true, note: 'Enter rated input watts, not HP' },
  { id: 'router', name: 'Decoder / router', watts: 25, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 1, nonInverterSurge: 1, supportsInverter: false },
  { id: 'laptop', name: 'Laptop / phones', watts: 75, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 1, nonInverterSurge: 1, supportsInverter: false },
  { id: 'sound', name: 'Sound system', watts: 120, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 1, nonInverterSurge: 1, supportsInverter: false },
  { id: 'standing-fan', name: 'Standing fan', watts: 55, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 2, nonInverterSurge: 2, supportsInverter: true },
  { id: 'microwave', name: 'Microwave', watts: 1200, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 1, nonInverterSurge: 1, supportsInverter: false, note: 'Use electrical input watts' },
  { id: 'pump', name: 'Water pump', watts: 1000, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 3, nonInverterSurge: 3, supportsInverter: true, note: 'Motor load' },
  { id: 'washer', name: 'Washing machine', watts: 500, quantity: 0, hoursPerDay: 0, inverter: false, surgeMultiplier: 3, nonInverterSurge: 3, supportsInverter: true, note: 'Motor load' },
];

function finiteNonNegative(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateSolarLoad(appliances: CalculatorAppliance[]) {
  const active = appliances.filter(item => item.quantity > 0 && item.watts > 0);
  const runningWatts = active.reduce(
    (sum, item) => sum + finiteNonNegative(item.watts) * finiteNonNegative(item.quantity),
    0,
  );
  const dailyKwh = active.reduce(
    (sum, item) => sum + finiteNonNegative(item.watts) * finiteNonNegative(item.quantity) * Math.min(24, finiteNonNegative(item.hoursPerDay)) / 1000,
    0,
  );
  const largestAdditionalSurgeWatts = active.reduce((largest, item) => {
    const extra = finiteNonNegative(item.watts)
      * finiteNonNegative(item.quantity)
      * Math.max(0, item.surgeMultiplier - 1);
    return Math.max(largest, extra);
  }, 0);
  const peakStartingWatts = runningWatts + largestAdditionalSurgeWatts;
  const requiredKva = Math.max(runningWatts * 1.25, peakStartingWatts) / 800;
  const inverter = [1.5, 1.7, 2.5, 3.5, 5, 10, 15, 20, 30].find(size => size >= requiredKva) || 30;
  const batteryKwh = dailyKwh * 1.25;
  const solarKw = dailyKwh / (4.5 * 0.78);
  const missingUsageHours = active.filter(item => item.hoursPerDay <= 0).map(item => item.name);

  return {
    active,
    runningWatts,
    largestAdditionalSurgeWatts,
    peakStartingWatts,
    dailyKwh,
    requiredKva,
    inverter,
    batteryKwh,
    solarKw,
    missingUsageHours,
    usageComplete: active.length > 0 && missingUsageHours.length === 0,
  };
}
