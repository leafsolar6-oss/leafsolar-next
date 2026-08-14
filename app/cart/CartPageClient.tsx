'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatNaira } from '@/lib/data';
import { useCart } from '@/components/cart/CartProvider';

export default function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <section className="container-wide py-10 sm:py-14">
      <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/">Home</Link><span>/</span><span className="text-gray-900">Cart</span></nav>
      <h1 className="font-display text-4xl font-black sm:text-5xl">Your shopping cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-20 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-leaf-50 text-leaf-700"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg></div>
          <h2 className="mt-5 font-display text-2xl font-black">Your cart is empty</h2><p className="mt-2 text-gray-500">Discover appliances, electronics and solar package starting points.</p><Link href="/products" className="btn btn-primary mt-6">Explore the store</Link>
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_370px]">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {items.map((item, index) => (
              <div key={item.product.id} className={`grid grid-cols-[86px_1fr] gap-4 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-6 ${index ? 'border-t border-gray-100' : ''}`}>
                <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden rounded-xl bg-gray-50"><Image src={item.product.image} alt="" fill sizes="120px" className="object-contain p-2" /></Link>
                <div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-wider text-leaf-700">{item.product.brand} · {item.product.categoryLabel}</p><Link href={`/products/${item.product.slug}`} className="mt-1 line-clamp-2 font-display font-bold leading-snug hover:text-leaf-700 sm:text-lg">{item.product.name}</Link><p className="mt-2 font-display text-lg font-black text-leaf-700 sm:hidden">{formatNaira(item.product.price)}</p><div className="mt-3 inline-flex items-center overflow-hidden rounded-lg border border-gray-200"><button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-9 w-9 hover:bg-gray-50">−</button><span className="grid h-9 min-w-9 place-items-center border-x border-gray-200 text-xs font-black">{item.quantity}</span><button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-9 w-9 hover:bg-gray-50">+</button></div><button onClick={() => removeItem(item.product.id)} className="ml-4 text-xs font-bold text-gray-400 hover:text-red-600">Remove</button></div>
                <div className="hidden text-right sm:block"><p className="font-display text-xl font-black">{formatNaira(item.product.price * item.quantity)}</p><p className="mt-1 text-xs text-gray-400">{formatNaira(item.product.price)} each</p></div>
              </div>
            ))}
          </div>

          <aside className="sticky top-40 rounded-2xl border border-gray-200 bg-[#f8f9f7] p-6">
            <h2 className="font-display text-xl font-black">Order summary</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between text-gray-600"><span>Subtotal</span><b className="text-gray-950">{formatNaira(subtotal)}</b></div><div className="flex justify-between text-gray-600"><span>Delivery</span><b className="text-leaf-700">Confirmed at checkout</b></div></div><div className="my-5 h-px bg-gray-200"/><div className="flex items-end justify-between"><span className="font-bold">Total</span><span className="font-display text-2xl font-black">{formatNaira(subtotal)}</span></div><p className="mt-4 rounded-xl bg-white p-3 text-xs leading-relaxed text-gray-500 ring-1 ring-gray-100">Delivery is free within Ibadan. Other locations require an owner-approved delivery quote before payment; timing is arranged for each paid order.</p><Link href="/checkout" className="btn btn-primary mt-5 w-full">Proceed to checkout</Link><Link href="/products" className="mt-3 block text-center text-xs font-extrabold text-gray-500 hover:text-leaf-700">Continue shopping</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
