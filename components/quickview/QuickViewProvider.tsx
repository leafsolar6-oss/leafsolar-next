'use client';

import Image from 'next/image';
import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { formatNaira, productBadge, type Product } from '@/lib/data';

type QuickViewContextValue = {
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
};

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openQuickView = useCallback((nextProduct: Product) => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setProduct(nextProduct);
  }, []);

  const closeQuickView = useCallback(() => {
    setProduct(null);
    window.requestAnimationFrame(() => {
      if (!document.querySelector('[role="dialog"][aria-label="Shopping cart"]')) triggerRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeQuickView();
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = document.querySelector('[role="dialog"][aria-label="Shopping cart"]') ? 'hidden' : previousOverflow;
    };
  }, [closeQuickView, product]);

  const value = useMemo<QuickViewContextValue>(() => ({
    openQuickView,
    closeQuickView,
  }), [closeQuickView, openQuickView]);

  return (
    <QuickViewContext.Provider value={value}>
      {children}
      {product && <QuickView product={product} close={closeQuickView} />}
    </QuickViewContext.Provider>
  );
}

function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) throw new Error('useQuickView must be used inside QuickViewProvider');
  return context;
}

export function QuickViewButton({ product, className = '' }: { product: Product; className?: string }) {
  const { openQuickView } = useQuickView();
  return (
    <button
      type="button"
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        openQuickView(product);
      }}
      className={`grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-md transition hover:border-leaf-300 hover:bg-leaf-50 hover:text-leaf-700 ${className}`}
      aria-label={`Quick view ${product.name}`}
    >
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.7"/></svg>
    </button>
  );
}

function QuickView({ product, close }: { product: Product; close: () => void }) {
  const badge = productBadge(product);
  const saving = product.oldPrice ? product.oldPrice - product.price : 0;
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter(element => !element.hasAttribute('hidden'));
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', trapFocus);
    return () => window.removeEventListener('keydown', trapFocus);
  }, []);

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
      <button type="button" className="absolute inset-0 bg-gray-950/55 backdrop-blur-[2px]" onClick={close} aria-label="Close quick view" />
      <section ref={panelRef} tabIndex={-1} className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-[1.5rem] bg-white shadow-2xl sm:max-w-4xl sm:rounded-[1.5rem]">
        <button type="button" onClick={close} autoFocus className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm hover:bg-gray-50" aria-label="Close quick view">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>

        <div className="grid md:grid-cols-[.9fr_1.1fr]">
          <div className="relative min-h-[280px] bg-[#f5f6f2] sm:min-h-[360px] md:min-h-[540px]">
            <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 768px) 100vw, 42vw" className="object-contain p-8 sm:p-12" />
            <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
              {badge && <span className="rounded-md bg-leaf-700 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">{badge}</span>}
              {saving > 0 && <span className="rounded-md bg-sun-400 px-2.5 py-1.5 text-[10px] font-black text-gray-950">Save {formatNaira(saving)}</span>}
            </div>
          </div>

          <div className="flex flex-col p-5 sm:p-8 md:p-10">
            <p className="pr-12 text-[10px] font-extrabold uppercase tracking-[.15em] text-leaf-700">{product.brand} · {product.categoryLabel}</p>
            <h2 id="quick-view-title" className="mt-2 pr-8 font-display text-2xl font-black leading-tight text-gray-950 sm:text-3xl">{product.name}</h2>
            {product.sku && <p className="mt-2 text-[11px] text-gray-400">SKU: {product.sku}</p>}

            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="font-display text-3xl font-black text-leaf-700">{formatNaira(product.price)}</span>
              {product.oldPrice && <span className="pb-1 text-sm text-gray-400 line-through">{formatNaira(product.oldPrice)}</span>}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-bold">
              <i className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={product.inStock ? 'text-emerald-700' : 'text-red-700'}>{product.inStock ? 'In stock — ready to order' : 'Currently out of stock'}</span>
            </div>

            <p className="mt-5 line-clamp-4 text-sm leading-6 text-gray-600 sm:text-base">{product.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-gray-600">
              <span className="rounded-xl bg-gray-50 px-2 py-3">✓ Current catalogue listing</span>
              <span className="rounded-xl bg-gray-50 px-2 py-3">✓ Confirm warranty terms</span>
              <span className="rounded-xl bg-gray-50 px-2 py-3">✓ Secure payment</span>
            </div>

            <div className="mt-auto pt-6">
              <AddToCartButton product={product} onAdded={close} className="h-14 w-full" />
              <Link href={`/products/${product.slug}`} onClick={close} className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-extrabold text-gray-800 transition hover:border-leaf-300 hover:text-leaf-700">
                View full details <span aria-hidden="true">→</span>
              </Link>
              <p className="mt-4 text-center text-[10px] leading-relaxed text-gray-400">Final order confirmation follows secure Paystack payment verification.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
