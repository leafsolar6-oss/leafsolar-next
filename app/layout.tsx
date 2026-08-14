import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/SiteShell';
import { site } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng'),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.sub,
  keywords: ['solar installation Ibadan', 'solar inverter Nigeria', 'lithium battery', 'home appliances Ibadan', 'Leaf Solar'],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.sub,
    type: 'website',
    siteName: site.name,
    locale: 'en_NG',
    images: [{ url: '/images/hero-appliances.jpg', width: 1267, height: 768, alt: 'Leaf Solar home appliances and solar solutions' }],
  },
  twitter: { card: 'summary_large_image', title: site.name, description: site.sub, images: ['/images/hero-appliances.jpg'] },
};

export const viewport: Viewport = {
  themeColor: '#10261a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
