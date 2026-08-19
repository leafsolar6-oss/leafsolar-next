'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/data';
import { filterProducts } from '@/lib/product-filters';

const PAGE_SIZE = 24;
const popularSearches = [
  { label: '32-inch TVs', query: 'TV 32' },
  { label: 'Inverter ACs', query: 'inverter AC' },
  { label: 'Air fryers', query: 'air fryer' },
  { label: 'Washing machines', query: 'washing machine' },
  { label: 'Lithium batteries', query: 'battery' },
  { label: 'Solar panels', query: 'solar panel' },
];

type InitialFilters = { q?: string; c?: string; d?: string; sort?: string; b?: string; min?: string; max?: string; a?: string };

export default function ProductsExplorer({ products, initial }: { products: Product[]; initial: InitialFilters }) {
  const [query, setQuery] = useState(initial.q || '');
  const [category, setCategory] = useState(initial.c || 'All');
  const [department, setDepartment] = useState(initial.d || 'all');
  const [sort, setSort] = useState(initial.sort || 'featured');
  const [brand, setBrand] = useState(initial.b || 'All');
  const [minPrice, setMinPrice] = useState(initial.min || '');
  const [maxPrice, setMaxPrice] = useState(initial.max || '');
  const [availability, setAvailability] = useState(initial.a || 'all');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    products
      .filter(item => department === 'all' || item.department === department)
      .forEach(item => counts.set(item.categoryLabel, (counts.get(item.categoryLabel) || 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [department, products]);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    products
      .filter(item => (department === 'all' || item.department === department) && (category === 'All' || item.categoryLabel === category))
      .forEach(item => counts.set(item.brand, (counts.get(item.brand) || 0) + 1));
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [category, department, products]);

  const filtered = useMemo(() => {
    const list = filterProducts(products, {
      q: query,
      c: category === 'All' ? undefined : category,
      d: department === 'all' ? undefined : department,
      b: brand === 'All' ? undefined : brand,
      min: minPrice || undefined,
      max: maxPrice || undefined,
      a: availability === 'all' ? undefined : availability,
    });
    return [...list].sort((a, b) => {
      if (sort === 'low') return a.price - b.price;
      if (sort === 'high') return b.price - a.price;
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'sale') return Number(b.onSale) - Number(a.onSale) || a.price - b.price;
      return Number(b.onSale) - Number(a.onSale) || a.id - b.id;
    });
  }, [availability, brand, category, department, maxPrice, minPrice, products, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Fallback content for empty searches: current offers, then featured, then anything.
  const popular = useMemo(() => {
    const pool = products.filter(product => product.onSale);
    if (pool.length >= 4) return pool.slice(0, 4);
    const featured = products.filter(product => product.featured);
    return [...pool, ...featured.filter(product => !pool.includes(product)), ...products.filter(product => !pool.includes(product) && !featured.includes(product))].slice(0, 4);
  }, [products]);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clear() {
    setQuery(''); setCategory('All'); setDepartment('all'); setSort('featured'); setBrand('All'); setMinPrice(''); setMaxPrice(''); setAvailability('all'); setPage(1);
  }

  const filterPanel = (
    <div>
      <div className="flex items-center justify-between"><h2 className="font-display text-lg font-extrabold">Departments</h2><button onClick={clear} className="text-xs font-bold text-leaf-700">Clear all</button></div>
      <div className="mt-4 space-y-1">
        {[
          ['all', 'All products'],
          ['electronics', 'Electronics & appliances'],
          ['solar', 'Solar equipment'],
          ['packages', 'Solar packages'],
        ].map(([value, label]) => (
          <button key={value} onClick={() => { setDepartment(value); setCategory('All'); setBrand('All'); setPage(1); setFiltersOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-bold ${department === value ? 'bg-leaf-50 text-leaf-800' : 'text-gray-600 hover:bg-gray-50'}`}>
            {label}<span className="text-[10px] text-gray-400">{value === 'all' ? products.length : products.filter(item => item.department === value).length}</span>
          </button>
        ))}
      </div>

      <div className="my-6 h-px bg-gray-100" />
      <h2 className="font-display text-lg font-extrabold">Categories</h2>
      <div className="mt-4 max-h-[450px] space-y-1 overflow-y-auto pr-1">
        <button onClick={() => { setCategory('All'); setBrand('All'); setPage(1); setFiltersOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${category === 'All' ? 'bg-leaf-50 text-leaf-800' : 'text-gray-600 hover:bg-gray-50'}`}>All categories<span className="text-[10px] text-gray-400">{products.filter(item => department === 'all' || item.department === department).length}</span></button>
        {categories.map(([name, count]) => (
          <button key={name} onClick={() => { setCategory(name); setBrand('All'); setPage(1); setFiltersOpen(false); }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${category === name ? 'bg-leaf-50 text-leaf-800' : 'text-gray-600 hover:bg-gray-50'}`}>
            <span>{name}</span><span className="text-[10px] text-gray-400">{count}</span>
          </button>
        ))}
      </div>

      <div className="my-6 h-px bg-gray-100" />
      <h2 className="font-display text-lg font-extrabold">Brand</h2>
      <select value={brand} onChange={event => { setBrand(event.target.value); setPage(1); }} className="mt-3 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 outline-none focus:border-leaf-600">
        <option value="All">All brands</option>{brands.map(([name, count]) => <option key={name} value={name}>{name} ({count})</option>)}
      </select>

      <div className="my-6 h-px bg-gray-100" />
      <h2 className="font-display text-lg font-extrabold">Price range</h2>
      <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Minimum<input value={minPrice} onChange={event => { setMinPrice(event.target.value); setPage(1); }} type="number" min="0" step="1" placeholder="₦ 0" className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-2 text-sm font-semibold text-gray-800 outline-none focus:border-leaf-600" /></label><label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Maximum<input value={maxPrice} onChange={event => { setMaxPrice(event.target.value); setPage(1); }} type="number" min="0" step="1" placeholder="No limit" className="mt-1 h-11 w-full rounded-xl border border-gray-200 px-2 text-sm font-semibold text-gray-800 outline-none focus:border-leaf-600" /></label></div>

      <div className="my-6 h-px bg-gray-100" />
      <h2 className="font-display text-lg font-extrabold">Availability</h2>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">{[['all', 'All'], ['in', 'In stock'], ['out', 'Out']].map(([value, label]) => <button key={value} type="button" onClick={() => { setAvailability(value); setPage(1); }} className={`rounded-lg px-2 py-2 text-[10px] font-black ${availability === value ? 'bg-white text-leaf-800 shadow-sm' : 'text-gray-500'}`}>{label}</button>)}</div>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr] xl:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block">{filterPanel}</aside>

      <div className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4" /></svg>
            <input value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} type="search" placeholder="Search this catalogue…" className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-leaf-600 focus:ring-2 focus:ring-leaf-600/10" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFiltersOpen(true)} className="btn btn-outline h-12 flex-1 px-4 text-sm lg:hidden">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4" /></svg> Filters
            </button>
            <label className="sr-only" htmlFor="sort">Sort products</label>
            <select id="sort" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }} className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 outline-none focus:border-leaf-600 sm:min-w-44">
              <option value="featured">Featured</option>
              <option value="sale">Sale offers</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="scrollbar-none mt-3 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Popular product searches">
          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-[.14em] text-gray-400">Popular</span>
          {popularSearches.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => { setQuery(item.query); setCategory('All'); setDepartment('all'); setBrand('All'); setMinPrice(''); setMaxPrice(''); setAvailability('all'); setPage(1); }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${query === item.query ? 'border-leaf-700 bg-leaf-700 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-leaf-300 hover:text-leaf-700'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <p className="text-sm text-gray-500"><b className="text-gray-900">{filtered.length}</b> products {category !== 'All' && <>in <b className="text-gray-900">{category}</b></>}</p>
          {(query || category !== 'All' || department !== 'all' || brand !== 'All' || minPrice || maxPrice || availability !== 'all') && <button onClick={clear} className="text-xs font-bold text-leaf-700">Reset results</button>}
        </div>

        {visible.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{visible.map(product => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-extrabold">{query ? <>No results for &ldquo;{query}&rdquo;</> : 'No products found'}</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-gray-500">{query ? "We couldn't match that search, but Leaf Solar stocks televisions, fridges, air conditioners, washing machines, kitchen appliances, fans and solar equipment. Try one of these instead:" : 'Try another search term or clear the current filters.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.slice(0, 6).map(([name]) => (
                  <button key={name} onClick={() => { setQuery(''); setDepartment('all'); setCategory(name); setBrand('All'); setPage(1); window.scrollTo({ top: 250, behavior: 'smooth' }); }} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-leaf-300 hover:text-leaf-700">{name}</button>
                ))}
              </div>
              <button onClick={clear} className="btn btn-primary mt-5">Clear search &amp; filters</button>
              {popular.length > 0 && (
                <div className="mt-10">
                  <h3 className="section-title">Popular right now</h3>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{popular.map(product => <ProductCard key={product.id} product={product} />)}</div>
                </div>
              )}
          </div>
        )}

        {pageCount > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Product pages">
            <button disabled={page === 1} onClick={() => { setPage(value => value - 1); window.scrollTo({ top: 250, behavior: 'smooth' }); }} className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-bold disabled:opacity-40">Previous</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} onClick={() => { setPage(number); window.scrollTo({ top: 250, behavior: 'smooth' }); }} className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-bold ${number === page ? 'bg-leaf-700 text-white' : 'border border-gray-200'}`}>{number}</button>)}
            <button disabled={page === pageCount} onClick={() => { setPage(value => value + 1); window.scrollTo({ top: 250, behavior: 'smooth' }); }} className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-bold disabled:opacity-40">Next</button>
          </nav>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden" role="dialog" aria-modal="true" aria-label="Product filters">
          <button className="absolute inset-0 bg-gray-950/40" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <aside className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-extrabold">Filter products</h2><button onClick={() => setFiltersOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-gray-200">×</button></div>
            {filterPanel}
          </aside>
        </div>
      )}
    </div>
  );
}
