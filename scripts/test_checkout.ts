import assert from 'node:assert/strict';
import { loadEnvFile } from 'node:process';
import {
  CheckoutError,
  checkoutSchema,
  checkoutValidationError,
  priceOrderItems,
} from '../lib/checkout';
import { canonicalOrderItems, isIbadanDeliveryArea } from '../lib/delivery';

try { loadEnvFile('.env.local'); } catch { /* CI and Vercel provide environment variables directly. */ }

async function main() {
  const validCustomer = {
    firstName: 'A',
    lastName: 'B',
    email: 'customer@example.com',
    phone: '08012345678',
    address: 'No 1',
    city: 'Oyo',
    state: 'Oyo',
    notes: '',
  };

  const valid = checkoutSchema.safeParse({
    customer: validCustomer,
    items: [{ id: '1119', quantity: 1 }],
  });
  if (!valid.success) throw valid.error;
  assert.equal(valid.data.items[0].id, 1119, 'practical short values and a persisted string product ID should validate and normalize');
  assert.equal((await priceOrderItems(valid.data.items)).subtotal, 112_550, 'the Mora TV must use its authoritative database price');

  for (const [field, value, expectedMessage] of [
    ['firstName', '   ', 'Enter your first name.'],
    ['lastName', '', 'Enter your last name.'],
    ['email', 'not-an-email', 'Enter a valid email address.'],
    ['phone', '123456', 'Enter a valid phone number with at least 7 characters.'],
    ['address', ' 1 ', 'Enter your delivery street address.'],
    ['city', 'X', 'Enter your delivery city or town.'],
  ] as const) {
    const result = checkoutSchema.safeParse({
      customer: { ...validCustomer, [field]: value },
      items: [{ id: 1119, quantity: 1 }],
    });
    assert.equal(result.success, false, `${field} should be rejected after trimming`);
    if (result.success) continue;
    assert.deepEqual(checkoutValidationError(result.error), { error: expectedMessage, field });
  }

  const invalidCart = checkoutSchema.safeParse({ customer: validCustomer, items: [{ id: 1119, quantity: 0 }] });
  assert.equal(invalidCart.success, false);
  if (!invalidCart.success) {
    assert.match(checkoutValidationError(invalidCart.error).error, /cart contains an invalid item or quantity/i);
  }

  await assert.rejects(
    () => priceOrderItems([{ id: 999_999_999, quantity: 1 }]),
    (error: unknown) => error instanceof CheckoutError && error.status === 409,
    'unknown products must not be purchasable',
  );

  await assert.rejects(
    () => priceOrderItems([{ id: 1119, quantity: 11 }, { id: 1119, quantity: 10 }]),
    (error: unknown) => error instanceof CheckoutError,
    'duplicate lines must not bypass the per-product quantity limit',
  );

  assert.equal(isIbadanDeliveryArea('Ibadan', 'Oyo State'), true, 'Ibadan in Oyo State must retain free delivery');
  assert.equal(isIbadanDeliveryArea('Ibadan North', 'Oyo'), true, 'an Ibadan district in Oyo must retain free delivery');
  assert.equal(isIbadanDeliveryArea('Ibadan', 'Lagos'), false, 'Ibadan text outside Oyo must not bypass delivery quoting');
  assert.equal(isIbadanDeliveryArea('Lagos', 'Lagos'), false, 'locations outside Ibadan must require a delivery quote');
  assert.deepEqual(
    canonicalOrderItems([{ id: 1120, quantity: 1 }, { id: 1119, quantity: 2 }, { id: 1120, quantity: 3 }]),
    [{ id: 1119, quantity: 2 }, { id: 1120, quantity: 4 }],
    'delivery quote carts must be normalized by product and quantity',
  );

  console.log('Checkout regression tests passed.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
