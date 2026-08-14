import type { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Leaf Solar electronics, appliance or solar order.',
  alternates: { canonical: '/checkout' },
  robots: { index: false, follow: true },
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ quote?: string }> }) {
  const params = await searchParams;
  const quoteToken = /^[a-f0-9]{48}$/.test(params.quote || '') ? params.quote! : '';
  return <CheckoutClient initialQuoteToken={quoteToken} />;
}
