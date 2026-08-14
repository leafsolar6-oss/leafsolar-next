'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { formatNaira, whatsappUrl } from '@/lib/data';
import { PAYMENT_COMPLETE_EVENT } from '@/components/cart/CartProvider';

export default function PaymentResult({ success, reference, amount }: {
  success: boolean;
  reference?: string;
  amount?: number;
}) {
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => window.dispatchEvent(new Event(PAYMENT_COMPLETE_EVENT)), 0);
    return () => window.clearTimeout(timer);
  }, [success]);

  return (
    <section className="container-x py-16 text-center sm:py-24">
      <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-7 shadow-xl shadow-leaf-900/5 sm:p-12">
        {success ? (
          <>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-leaf-50 text-leaf-700">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m5 12 4 4L19 6" /></svg>
            </div>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[.18em] text-leaf-700">Payment confirmed</p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Thank you for your order.</h1>
            <p className="mt-4 leading-relaxed text-gray-600">Your payment was verified securely with Paystack. Leaf Solar will contact you to arrange delivery.</p>
            {amount && <p className="mt-5 font-display text-3xl font-black text-leaf-800">{formatNaira(amount)}</p>}
            <div className="mx-auto mt-6 rounded-xl bg-gray-50 px-4 py-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Order reference</span>
              <b className="mt-1 block font-display text-xl">{reference}</b>
            </div>
            <p className="mt-5 text-xs text-gray-500">Keep this verified Paystack reference with your order records.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/products" className="btn btn-outline">Continue shopping</Link>
              <a href={whatsappUrl(`Hello Leaf Solar! I just paid for order ${reference}.`)} className="btn bg-[#25D366] text-white">Open WhatsApp</a>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-50 text-amber-700">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /></svg>
            </div>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[.18em] text-amber-700">Payment not confirmed</p>
            <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">We could not verify this payment.</h1>
            <p className="mt-4 leading-relaxed text-gray-600">If your account was debited, do not pay again. Contact Leaf Solar with your reference so we can confirm the transaction.</p>
            {reference && <div className="mx-auto mt-6 rounded-xl bg-gray-50 px-4 py-4"><span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Reference</span><b className="mt-1 block font-display text-xl">{reference}</b></div>}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/checkout" className="btn btn-outline">Return to checkout</Link>
              <a href={whatsappUrl(`Hello Leaf Solar! I need help checking Paystack payment ${reference || ''}.`)} className="btn bg-[#25D366] text-white">Get payment help</a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
