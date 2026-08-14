'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { formatNaira, whatsappUrl } from '@/lib/data';
import { isIbadanDeliveryArea } from '@/lib/delivery';
import { useCart } from '@/components/cart/CartProvider';

const states = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

type PublicQuote = {
  code: string;
  status: string;
  subtotal: number;
  deliveryAmount: number | null;
  paymentReady: boolean;
};

type QuoteRequest = {
  code: string;
  token: string;
  customerCheckoutUrl: string;
  whatsappUrl: string;
};

async function fetchPublicQuote(token: string) {
  const response = await fetch(`/api/delivery-quotes/${encodeURIComponent(token)}`, { cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Delivery quote not found.');
  return result as PublicQuote;
}

export default function CheckoutClient({ initialQuoteToken = '' }: { initialQuoteToken?: string }) {
  const { items, subtotal } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Oyo');
  const [quoteToken, setQuoteToken] = useState(initialQuoteToken);
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(Boolean(initialQuoteToken));
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [updatedPayment, setUpdatedPayment] = useState<{ authorizationUrl: string; total: number } | null>(null);

  const refreshQuote = useCallback(async () => {
    if (!quoteToken) return;
    setQuoteLoading(true);
    try {
      const result = await fetchPublicQuote(quoteToken);
      setQuote(result);
      setError('');
    } catch (caught) {
      setQuote(null);
      setError(caught instanceof Error ? caught.message : 'Could not check this delivery quote.');
    } finally {
      setQuoteLoading(false);
    }
  }, [quoteToken]);

  useEffect(() => {
    if (!quoteToken) return;
    let active = true;
    fetchPublicQuote(quoteToken).then(result => {
      if (!active) return;
      setQuote(result);
      setError('');
    }).catch(caught => {
      if (!active) return;
      setQuote(null);
      setError(caught instanceof Error ? caught.message : 'Could not check this delivery quote.');
    }).finally(() => {
      if (active) setQuoteLoading(false);
    });
    return () => { active = false; };
  }, [quoteToken]);

  const ibadanDelivery = isIbadanDeliveryArea(city, state);
  const quoteApproved = Boolean(quote && ['approved', 'payment_ready'].includes(quote.status) && quote.deliveryAmount !== null);
  const deliveryAmount = !ibadanDelivery && quoteApproved ? quote!.deliveryAmount! : 0;
  const displayedTotal = subtotal + deliveryAmount;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setError('');
    setQuoteRequest(null);
    setUpdatedPayment(null);
    const form = new FormData(formElement);
    const customer: Record<string, string> = Object.fromEntries(
      ['firstName','lastName','email','phone','address','city','state','notes'].map(key => [key, String(form.get(key) || '').trim()]),
    );
    const trimmedMinimums = [
      ['firstName', 1, 'Enter your first name.'],
      ['lastName', 1, 'Enter your last name.'],
      ['phone', 7, 'Enter a valid phone number with at least 7 characters.'],
      ['address', 3, 'Enter your delivery street address.'],
      ['city', 2, 'Enter your delivery city or town.'],
    ] as const;
    for (const [fieldName, minimum, message] of trimmedMinimums) {
      if (customer[fieldName].length < minimum) {
        showFieldError(formElement, fieldName, message);
        setError(message);
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      customer,
      items: items.map(item => ({ id: item.product.id, quantity: item.quantity })),
      ...(!ibadanDelivery && quoteToken ? { deliveryQuoteToken: quoteToken } : {}),
    };

    try {
      if (!ibadanDelivery && !quoteApproved) {
        if (quoteToken && quote?.status === 'requested') {
          setError(`Delivery quote ${quote.code} is awaiting owner approval. Send or follow up on WhatsApp, then refresh its status.`);
          setSubmitting(false);
          return;
        }
        if (quoteToken && ['declined', 'expired', 'paid'].includes(quote?.status || '')) {
          setError('This delivery quote cannot be used. Start a new quote request for this order.');
          setSubmitting(false);
          return;
        }

        const response = await fetch('/api/delivery-quotes/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) {
          if (typeof result.field === 'string') showFieldError(formElement, result.field, result.error || 'Please check this field.');
          throw new Error(result.error || 'Could not create a delivery quote request.');
        }
        setQuoteToken(result.token);
        setQuote({ code: result.code, status: 'requested', subtotal, deliveryAmount: null, paymentReady: false });
        setQuoteRequest(result as QuoteRequest);
        window.history.replaceState(null, '', `/checkout?quote=${encodeURIComponent(result.token)}`);
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        if (typeof result.field === 'string') showFieldError(formElement, result.field, result.error || 'Please check this field.');
        throw new Error(result.error || 'Could not open secure payment.');
      }
      if (typeof result.authorizationUrl !== 'string' || !result.authorizationUrl.startsWith('https://checkout.paystack.com/')) {
        throw new Error('The secure payment link was invalid. Please try again.');
      }
      if (typeof result.total !== 'number') throw new Error('The confirmed order total was invalid. Please try again.');
      if (result.total !== displayedTotal) {
        setUpdatedPayment({ authorizationUrl: result.authorizationUrl, total: result.total });
        setSubmitting(false);
        return;
      }
      window.location.assign(result.authorizationUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not continue checkout.');
      setSubmitting(false);
    }
  }

  function startNewQuote() {
    setQuote(null);
    setQuoteToken('');
    setQuoteRequest(null);
    setError('');
    window.history.replaceState(null, '', '/checkout');
  }

  if (items.length === 0) {
    return (
      <section className="container-x py-20 text-center">
        <h1 className="font-display text-4xl font-black">Nothing to check out yet</h1>
        <p className="mt-3 text-gray-500">Add products to your cart before proceeding to checkout.</p>
        <Link href="/products" className="btn btn-primary mt-6">Shop products</Link>
      </section>
    );
  }

  const quoteFollowUp = quote?.code
    ? whatsappUrl(`Hello Leaf Solar, I am following up on delivery quote ${quote.code}. Please let me know when it is approved so I can pay securely.`)
    : whatsappUrl('Hello Leaf Solar, I need a delivery quote before I complete Paystack payment.');

  return (
    <section className="bg-[#f7f8f6] py-9 sm:py-12">
      <div className="container-wide">
        <nav className="mb-5 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/">Home</Link><span>/</span><Link href="/cart">Cart</Link><span>/</span><span className="text-gray-900">Checkout</span></nav>
        <h1 className="font-display text-4xl font-black sm:text-5xl">Secure online checkout</h1>
        <p className="mt-2 text-sm text-gray-500">Ibadan delivery is free. Other locations need an owner-approved delivery quote before Paystack payment.</p>

        <form onSubmit={submit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-leaf-700 text-sm font-black text-white">1</span><h2 className="font-display text-xl font-black">Contact information</h2></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="First name" name="firstName" autoComplete="given-name" minLength={1} maxLength={60} />
                <Field label="Last name" name="lastName" autoComplete="family-name" minLength={1} maxLength={60} />
                <Field label="Email address" name="email" type="email" autoComplete="email" maxLength={160} />
                <Field label="Phone number" name="phone" type="tel" autoComplete="tel" minLength={7} maxLength={30} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-leaf-700 text-sm font-black text-white">2</span><h2 className="font-display text-xl font-black">Delivery address</h2></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-gray-700">Street address</span><input required name="address" autoComplete="street-address" minLength={3} maxLength={240} onInput={event => event.currentTarget.setCustomValidity('')} placeholder="House number, street and nearest landmark" className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-leaf-600" /></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-700">City / town</span><input required name="city" value={city} onChange={event => setCity(event.target.value)} autoComplete="address-level2" minLength={2} maxLength={80} className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-leaf-600" /></label>
                <label><span className="mb-1.5 block text-xs font-bold text-gray-700">State</span><select required name="state" value={state} onChange={event => setState(event.target.value)} autoComplete="address-level1" className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-leaf-600">{states.map(item => <option key={item}>{item}</option>)}</select></label>
                <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-gray-700">Order notes <i className="font-normal text-gray-400">(optional)</i></span><textarea name="notes" rows={4} maxLength={1000} onInput={event => event.currentTarget.setCustomValidity('')} placeholder="Delivery instructions or anything we should know" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-leaf-600" /></label>
              </div>

              <div className={`mt-5 rounded-xl border p-4 ${ibadanDelivery ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
                <b className="text-sm">{ibadanDelivery ? 'Free Ibadan delivery' : quoteApproved ? `Delivery quote ${quote?.code} approved` : 'Delivery quote required before payment'}</b>
                <p className="mt-1 text-xs leading-5">{ibadanDelivery ? 'No delivery charge will be added at Paystack.' : quoteApproved ? `Approved delivery amount: ${formatNaira(deliveryAmount)}. Enter the same details used for the quote.` : 'Submit these details to create a quote request. Leaf Solar will enter the actual delivery amount and approve it—no automatic rate is guessed.'}</p>
                {!ibadanDelivery && quoteToken && <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void refreshQuote()} disabled={quoteLoading} className="rounded-lg bg-white px-3 py-2 text-xs font-extrabold ring-1 ring-amber-200 disabled:opacity-60">{quoteLoading ? 'Checking…' : 'Refresh quote status'}</button><a href={quoteFollowUp} className="rounded-lg bg-[#25D366] px-3 py-2 text-xs font-extrabold text-white">Follow up on WhatsApp</a><button type="button" onClick={startNewQuote} className="px-2 py-2 text-xs font-bold text-amber-800 underline">Start new quote</button></div>}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-leaf-700 text-sm font-black text-white">3</span><h2 className="font-display text-xl font-black">Payment</h2></div>
              <div className={`mt-6 rounded-xl border-2 p-5 ${ibadanDelivery || quoteApproved ? 'border-[#08a88a] bg-[#effcf8]' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${ibadanDelivery || quoteApproved ? 'border-[#08a88a]' : 'border-gray-300'}`}>{(ibadanDelivery || quoteApproved) && <span className="h-3 w-3 rounded-full bg-[#08a88a]" />}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><b className="text-sm">{ibadanDelivery || quoteApproved ? 'Pay securely online' : 'Paystack unlocks after quote approval'}</b><span className="rounded bg-[#0ba4db] px-2 py-1 text-[10px] font-black tracking-wide text-white">PAYSTACK</span></div>
                    <p className="mt-2 text-xs leading-relaxed text-gray-600">{ibadanDelivery || quoteApproved ? 'You will be redirected to Paystack to complete the full confirmed amount.' : 'Outside-Ibadan payments are blocked until Leaf Solar approves the delivery amount.'}</p>
                    <p className="mt-3 text-[10px] font-bold text-gray-500">Paystack will show the payment methods currently available for this transaction.</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-500">
                <svg viewBox="0 0 24 24" width="16" height="16" className="mt-0.5 shrink-0 text-leaf-700" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                Leaf Solar never receives or stores your card or bank credentials. Payment is processed on Paystack&apos;s encrypted checkout.
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-40 sm:p-7">
            <h2 className="font-display text-xl font-black">Your order</h2>
            <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.product.id} className="grid grid-cols-[60px_1fr_auto] items-center gap-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50"><Image src={item.product.image} alt="" fill sizes="60px" className="object-contain p-1.5"/><span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-gray-800 px-1 text-[9px] font-black text-white">{item.quantity}</span></div>
                  <p className="line-clamp-2 text-xs font-bold leading-snug">{item.product.name}</p>
                  <b className="text-xs">{formatNaira(item.product.price * item.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="my-5 h-px bg-gray-100"/>
            <div className="space-y-3 text-sm"><div className="flex justify-between text-gray-600"><span>Products</span><b className="text-gray-950">{formatNaira(subtotal)}</b></div><div className="flex justify-between text-gray-600"><span>Delivery</span><b className="text-leaf-700">{ibadanDelivery ? 'Free — Ibadan' : quoteApproved ? formatNaira(deliveryAmount) : 'Quote required'}</b></div></div>
            <div className="my-5 h-px bg-gray-100"/>
            <div className="flex items-end justify-between"><span className="font-bold">{ibadanDelivery || quoteApproved ? 'Pay now' : 'Product subtotal'}</span><b className="font-display text-2xl font-black">{formatNaira(displayedTotal)}</b></div>

            {quoteRequest && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><b className="text-sm text-emerald-900">Quote request {quoteRequest.code} created</b><p className="mt-1 text-xs leading-5 text-emerald-800">Send it to Leaf Solar on WhatsApp. After the owner enters and approves the actual delivery amount, return here and refresh the status.</p><a href={quoteRequest.whatsappUrl} className="btn mt-4 w-full bg-[#25D366] text-white hover:bg-[#1ead53]">Send request on WhatsApp</a></div>}
            {error && <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700"><p>{error}</p><a href={quoteFollowUp} className="mt-2 inline-block underline">Get help on WhatsApp</a></div>}
            {updatedPayment ? <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><b className="text-sm text-amber-900">The confirmed amount has changed</b><p className="mt-1 text-xs leading-5 text-amber-800">The current secure payment total is <strong>{formatNaira(updatedPayment.total)}</strong>. Review this amount before continuing.</p><button type="button" onClick={() => window.location.assign(updatedPayment.authorizationUrl)} className="btn mt-4 w-full bg-amber-500 text-gray-950 hover:bg-amber-600">Accept and pay {formatNaira(updatedPayment.total)}</button></div> : !quoteRequest && <button disabled={submitting || quoteLoading} className="btn btn-primary mt-6 h-14 w-full text-base disabled:cursor-wait disabled:opacity-60">{submitting ? (ibadanDelivery || quoteApproved ? 'Opening secure payment…' : 'Creating quote request…') : quoteLoading ? 'Checking delivery quote…' : ibadanDelivery || quoteApproved ? `Pay ${formatNaira(displayedTotal)} securely` : 'Request delivery quote'}</button>}
            <p className="mt-4 text-center text-[10px] leading-relaxed text-gray-400">Your order is confirmed only after Paystack verifies successful payment. Outside Ibadan, Paystack is available only after the delivery quote is approved.</p>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ label, name, type = 'text', autoComplete, minLength, maxLength }: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
}) {
  return <label><span className="mb-1.5 block text-xs font-bold text-gray-700">{label}</span><input required name={name} type={type} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} onInput={event => event.currentTarget.setCustomValidity('')} className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-leaf-600" /></label>;
}

function showFieldError(form: HTMLFormElement, fieldName: string, message: string) {
  const field = form.elements.namedItem(fieldName);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    field.setCustomValidity(message);
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    field.reportValidity();
  }
}
