export const IBADAN_FREE_DELIVERY_LABEL = 'Free delivery in Ibadan';

function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ');
}

/**
 * The published free-delivery area is Ibadan, Oyo State. We deliberately avoid
 * estimating rates for any other location: those orders require an owner quote.
 */
export function isIbadanDeliveryArea(city: string, state: string) {
  const normalizedCity = normalizeLocation(city);
  const normalizedState = normalizeLocation(state).replace(/ state$/, '');
  return normalizedState === 'oyo' && (normalizedCity === 'ibadan' || normalizedCity.startsWith('ibadan '));
}

export function canonicalOrderItems(items: Array<{ id: number; quantity: number }>) {
  const quantities = new Map<number, number>();
  for (const item of items) quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
  return [...quantities.entries()]
    .sort(([first], [second]) => first - second)
    .map(([id, quantity]) => ({ id, quantity }));
}
