import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/SiteShell';
import { site } from '@/lib/data';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Leaf Solar | Solar Installation & Appliances in Ibadan',
    template: '%s | Leaf Solar',
  },
  description: 'Shop electronics, home appliances, solar panels, batteries and solar package starting points from Leaf Solar in Ibadan, or request a project quotation.',
  applicationName: 'Leaf Solar',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'Leaf Solar',
    title: 'Leaf Solar | Solar Installation & Appliances in Ibadan',
    description: 'Solar planning, equipment, electronics and home appliances from Leaf Solar in Ibadan.',
    images: [{ url: '/leaf-solar-og.jpg', width: 1200, height: 630, alt: 'Leaf Solar — solar, electronics and appliances in Ibadan' }],
  },
  icons: {
    icon: [{ url: '/leaf-solar-logo.png', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/leaf-solar-logo.png', sizes: '512x512' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#10261a',
};

const globalStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Store',
      '@id': `${siteUrl}/#store`,
      name: site.name,
      legalName: site.name,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/leaf-solar-logo.png`, width: 512, height: 512 },
      image: `${siteUrl}/leaf-solar-og.jpg`,
      description: site.sub,
      slogan: site.tagline,
      telephone: site.phoneHref,
      email: site.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop 4, DP Plaza, beside Living Proof Supermarket Junction, Akala Express',
        addressLocality: 'Ibadan',
        addressRegion: 'Oyo State',
        addressCountry: 'NG',
      },
      areaServed: { '@type': 'City', name: 'Ibadan' },
      identifier: { '@type': 'PropertyValue', propertyID: 'Company registration', value: site.rcNumber },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: site.phoneHref,
        email: site.email,
        contactType: 'customer support',
        areaServed: 'NG',
        availableLanguage: 'English',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Leaf Solar product and service catalogue',
        itemListElement: [
          { '@type': 'OfferCatalog', name: 'Solar equipment and package starting points', url: `${siteUrl}/solar-products` },
          { '@type': 'OfferCatalog', name: 'Home appliances and electronics', url: `${siteUrl}/home-appliances-ibadan` },
          { '@type': 'OfferCatalog', name: 'Solar installation planning in Ibadan', url: `${siteUrl}/solar-installation-ibadan` },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Leaf Solar',
      description: 'Leaf Solar solar planning, equipment, electronics and home-appliance storefront.',
      inLanguage: 'en-NG',
      publisher: { '@id': `${siteUrl}/#store` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalStructuredData).replace(/</g, '\\u003c') }} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
