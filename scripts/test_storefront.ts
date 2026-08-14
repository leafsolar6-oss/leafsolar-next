import assert from 'node:assert/strict';
import { products } from '../lib/data';

const popularSearches = [
  ['32-inch TVs', 'TV 32'],
  ['Inverter ACs', 'inverter AC'],
  ['Air fryers', 'air fryer'],
  ['Washing machines', 'washing machine'],
  ['Lithium batteries', 'battery'],
  ['Solar panels', 'solar panel'],
] as const;

function matchesSearch(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return products.filter(product => {
    const searchable = `${product.name} ${product.brand} ${product.categoryLabel} ${product.sku}`.toLowerCase();
    return terms.every(term => searchable.includes(term));
  });
}

for (const [label, query] of popularSearches) {
  assert.ok(matchesSearch(query).length > 0, `${label} shortcut must return at least one product`);
}

for (const category of [
  'Televisions',
  'Audio & Sound',
  'Fridges & Freezers',
  'Air Conditioners',
  'Washers & Dryers',
  'Kitchen & Cooking',
  'Fans & Coolers',
  'Water & Dispensers',
  'Solar Panels',
  'Solar Batteries',
  'Inverters',
  'Generators & Power',
]) {
  assert.ok(products.some(product => product.categoryLabel === category), `${category} department must have products`);
}

assert.equal(products.length, 114, 'the curated catalogue must remain complete');
assert.equal(products.find(product => product.id === 1119)?.price, 112_550, 'Mora TV authoritative price must not change');

console.log('Storefront enhancement regression tests passed.');
