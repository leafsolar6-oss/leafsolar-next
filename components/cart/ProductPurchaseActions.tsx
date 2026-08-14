'use client';

import { useState } from 'react';
import type { Product } from '@/lib/data';
import { useCart } from './CartProvider';

export default function ProductPurchaseActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="inline-flex h-14 w-full items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-white sm:w-36">
        <button onClick={() => setQuantity(value => Math.max(1, value - 1))} className="h-full w-12 text-xl hover:bg-gray-50" aria-label="Decrease quantity">−</button>
        <span className="grid h-full min-w-12 place-items-center border-x border-gray-200 text-sm font-black">{quantity}</span>
        <button onClick={() => setQuantity(value => Math.min(20, value + 1))} className="h-full w-12 text-xl hover:bg-gray-50" aria-label="Increase quantity">+</button>
      </div>
      <button onClick={() => addItem(product, quantity)} disabled={!product.inStock} className="btn btn-primary h-14 flex-1 text-base disabled:bg-gray-300">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><path d="M12 8v5m-2.5-2.5h5"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
        {product.inStock ? 'Add to cart' : 'Out of stock'}
      </button>
    </div>
  );
}
