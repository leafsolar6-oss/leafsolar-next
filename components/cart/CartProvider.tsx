'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '@/lib/data';
import { formatNaira } from '@/lib/data';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'leafsolar-cart-v2';
export const PAYMENT_COMPLETE_EVENT = 'leafsolar:payment-complete';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const paymentCompleted = useRef(false);

  useEffect(() => {
    let savedItems: CartItem[] = [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) savedItems = JSON.parse(saved);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    const timer = window.setTimeout(() => {
      setItems(paymentCompleted.current ? [] : savedItems);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    function clearPaidCart() {
      paymentCompleted.current = true;
      window.localStorage.setItem(STORAGE_KEY, '[]');
      setItems([]);
      setIsOpen(false);
      setReady(true);
    }
    window.addEventListener(PAYMENT_COMPLETE_EVENT, clearPaidCart);
    return () => window.removeEventListener(PAYMENT_COMPLETE_EVENT, clearPaidCart);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    isOpen,
    addItem(product, quantity = 1) {
      setItems(current => {
        const existing = current.find(item => item.product.id === product.id);
        if (existing) {
          return current.map(item => item.product.id === product.id
            ? { ...item, quantity: Math.min(20, item.quantity + quantity) }
            : item);
        }
        return [...current, { product, quantity: Math.max(1, quantity) }];
      });
      setIsOpen(true);
    },
    updateQuantity(id, quantity) {
      if (quantity <= 0) {
        setItems(current => current.filter(item => item.product.id !== id));
      } else {
        setItems(current => current.map(item => item.product.id === id
          ? { ...item, quantity: Math.min(20, quantity) }
          : item));
      }
    },
    removeItem(id) {
      setItems(current => current.filter(item => item.product.id !== id));
    },
    clear() { setItems([]); },
    openCart() { setIsOpen(true); },
    closeCart() { setIsOpen(false); },
  }), [isOpen, items]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button className="absolute inset-0 bg-gray-950/45 backdrop-blur-[2px]" onClick={closeCart} aria-label="Close cart" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-5 sm:px-7">
          <div>
            <p className="font-display text-xl font-extrabold">Your cart</p>
            <p className="text-xs text-gray-500">{count} {count === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={closeCart} className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50" aria-label="Close cart">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-leaf-50 text-leaf-700">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
            </div>
            <h2 className="mt-5 font-display text-2xl font-extrabold">Your cart is empty</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">Browse electronics, appliances and solar package starting points.</p>
            <Link href="/products" onClick={closeCart} className="btn btn-primary mt-6">Start shopping</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
              {items.map(item => (
                <div key={item.product.id} className="grid grid-cols-[76px_1fr] gap-4">
                  <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                    <Image src={item.product.image} alt="" fill sizes="76px" className="object-contain p-2" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="line-clamp-2 text-sm font-bold leading-snug hover:text-leaf-700">{item.product.name}</Link>
                      <button onClick={() => removeItem(item.product.id)} className="shrink-0 text-gray-400 hover:text-red-600" aria-label={`Remove ${item.product.name}`}>
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6" /></svg>
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-leaf-700">{formatNaira(item.product.price)}</p>
                    <div className="mt-2 inline-flex items-center overflow-hidden rounded-lg border border-gray-200">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 hover:bg-gray-50" aria-label="Decrease quantity">−</button>
                      <span className="grid h-8 min-w-8 place-items-center border-x border-gray-200 text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-8 w-8 hover:bg-gray-50" aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 bg-white px-5 py-5 sm:px-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Subtotal</span>
                <span className="font-display text-2xl font-extrabold">{formatNaira(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-gray-500">Delivery is confirmed during checkout. Delivery is free within Ibadan; other destinations require an approved quote before payment.</p>
              <Link href="/checkout" onClick={closeCart} className="btn btn-primary w-full rounded-xl">Proceed to checkout</Link>
              <Link href="/cart" onClick={closeCart} className="mt-2 flex w-full justify-center py-2 text-sm font-bold text-gray-600 hover:text-leaf-700">View full cart</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
