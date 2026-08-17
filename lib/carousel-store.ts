import 'server-only';

import { list } from '@vercel/blob';

/**
 * Hero carousel slides. Owner-uploaded photos live in the Vercel Blob store
 * under the `carousel/` prefix and are managed from /admin/carousel.
 * When no photos have been uploaded (or Blob is unreachable), the storefront
 * falls back to bundled catalogue imagery so the hero never renders empty.
 */

export type CarouselSlide = { src: string; alt: string };

export const DEFAULT_HERO_SLIDES: CarouselSlide[] = [
  { src: '/images/hero-appliances.jpg', alt: 'Televisions, refrigerator, washing machine, cooker, air conditioner and home appliances' },
  { src: '/images/categories/solar.webp', alt: 'Solar panels, battery and inverter equipment' },
  { src: '/images/categories/tvs.webp', alt: 'Smart televisions from the Leaf Solar catalogue' },
  { src: '/images/categories/fridges-freezers.webp', alt: 'Refrigerators and freezers from the Leaf Solar catalogue' },
];

export const CAROUSEL_ALT = 'Leaf Solar Ibadan — electronics, appliances and solar installations';

export async function getHeroSlides(): Promise<CarouselSlide[]> {
  try {
    const { blobs } = await list({ prefix: 'carousel/' });
    const images = blobs
      .filter((blob) => /\.(jpe?g|png|webp)$/i.test(blob.pathname))
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? -1 : a.uploadedAt > b.uploadedAt ? 1 : 0))
      .map((blob) => ({ src: blob.url, alt: CAROUSEL_ALT }));
    return images.length > 0 ? images : DEFAULT_HERO_SLIDES;
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}
