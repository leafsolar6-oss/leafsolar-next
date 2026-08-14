import type { Metadata } from 'next';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your Leaf Solar order before checkout.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: true },
};

export default function CartPage() { return <CartPageClient />; }
