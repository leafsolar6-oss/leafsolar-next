'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShoppingAssistant, { MobileBottomNav } from '@/components/ShoppingAssistant';
import { CartProvider } from '@/components/cart/CartProvider';
import { QuickViewProvider } from '@/components/quickview/QuickViewProvider';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <main className="min-h-screen">{children}</main>;

  return (
    <CartProvider>
      <QuickViewProvider>
        <div className="flex min-h-screen flex-col pb-[4.25rem] sm:pb-0">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ShoppingAssistant />
          <MobileBottomNav />
        </div>
      </QuickViewProvider>
    </CartProvider>
  );
}
