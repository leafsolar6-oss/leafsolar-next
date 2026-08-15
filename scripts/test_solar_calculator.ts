import assert from 'node:assert/strict';
import {
  calculateSolarLoad,
  defaultCalculatorAppliances,
  type CalculatorAppliance,
} from '../lib/solar-calculator';

const initial = calculateSolarLoad(defaultCalculatorAppliances);
assert.equal(initial.runningWatts, 0, 'the calculator must not assume a default running load');
assert.equal(initial.dailyKwh, 0, 'the calculator must not assume default daily usage');
assert.ok(defaultCalculatorAppliances.every(item => item.quantity === 0 && item.hoursPerDay === 0), 'quantity and appliance-specific hours must start at zero');
assert.deepEqual(new Set(defaultCalculatorAppliances.map(item => item.surgeMultiplier)), new Set([1, 2, 3, 4]), 'the appliance library must include ×1, ×2, ×3 and ×4 starting-load presets');

const selected = defaultCalculatorAppliances.map(item => ({ ...item }));
const lights = selected.find(item => item.id === 'lights');
const fridge = selected.find(item => item.id === 'fridge');
assert.ok(lights && fridge);
Object.assign(lights, { quantity: 2, hoursPerDay: 5 });
Object.assign(fridge, { quantity: 1, hoursPerDay: 8 });

const nonInverterLoad = calculateSolarLoad(selected);
assert.equal(nonInverterLoad.runningWatts, 200);
assert.equal(nonInverterLoad.peakStartingWatts, 740, 'the ×4 fridge preset must add its starting surge to the other running loads');
assert.equal(nonInverterLoad.dailyKwh, 1.54, 'daily energy must use the hours entered against each appliance');
assert.equal(nonInverterLoad.usageComplete, true);

Object.assign(fridge, { inverter: true, surgeMultiplier: 1 });
const inverterLoad = calculateSolarLoad(selected);
assert.equal(inverterLoad.peakStartingWatts, 200, 'an inverter/soft-start appliance set to ×1 must not add a starting surge');

const custom: CalculatorAppliance = {
  id: 'custom-motor',
  name: 'Custom motor',
  watts: 500,
  quantity: 2,
  hoursPerDay: 3,
  inverter: false,
  surgeMultiplier: 3,
  nonInverterSurge: 3,
  supportsInverter: true,
  custom: true,
};
const customLoad = calculateSolarLoad([custom]);
assert.equal(customLoad.runningWatts, 1000);
assert.equal(customLoad.peakStartingWatts, 3000, 'custom appliance surge must affect the peak starting load');
assert.equal(customLoad.dailyKwh, 3, 'custom appliance hours must affect daily energy');
assert.equal(customLoad.inverter, 5, 'inverter selection must account for the custom appliance starting load');

const missingHours = calculateSolarLoad([{ ...custom, hoursPerDay: 0 }]);
assert.deepEqual(missingHours.missingUsageHours, ['Custom motor']);
assert.equal(missingHours.usageComplete, false, 'package sizing must wait until each selected appliance has usage hours');

console.log('Solar calculator regression tests passed.');
