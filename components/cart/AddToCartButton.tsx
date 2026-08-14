'use client';

import { useState } from 'react';
import type { Product } from '@/lib/data';
import { useCart } from './CartProvider';

export default function AddToCartButton({
  product,
  quantity = 1,
  compact = false,
  className = '',
  onAdded,
}: {
  product: Product;
  quantity?: number;
  compact?: boolean;
  className?: string;
  onAdded?: () => void;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function add() {
    addItem(product, quantity);
    setAdded(true);
    onAdded?.();
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={event => { event.preventDefault(); event.stopPropagation(); add(); }}
      disabled={!product.inStock}
      className={`${compact ? 'grid h-10 w-10 place-items-center rounded-full' : 'btn rounded-xl'} bg-leaf-700 font-bold text-white transition hover:bg-leaf-800 disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
      aria-label={compact ? `Add ${product.name} to cart` : product.inStock ? `Add to cart: ${product.name}` : `Out of stock: ${product.name}`}
    >
      {added ? (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 4 4L19 6" /></svg>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><path d="M12 8v5m-2.5-2.5h5"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
          {!compact && (product.inStock ? 'Add to cart' : 'Out of stock')}
        </>
      )}
    </button>
  );
}
