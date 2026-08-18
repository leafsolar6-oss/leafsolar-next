import 'server-only';

import { list } from '@vercel/blob';

/**
 * Hero carousel slides. Owner-uploaded photos live in the Vercel Blob store
 * under the `carousel/` prefix and are managed from /admin/carousel.
 * When no photos have been uploaded (or Blob is unreachable), the storefront
 * falls back to bundled catalogue imagery so the hero never renders empty.
 */

export type CarouselSlide = { src: string; alt: string; caption?: string };

export const DEFAULT_HERO_SLIDES: CarouselSlide[] = [
  { src: '/images/carousel/01-rooftop-array-town.jpg', alt: 'Completed rooftop solar panel array installation overlooking Ibadan', caption: 'Rooftop solar array · Ibadan' },
  { src: '/images/carousel/02-commercial-roof-mounting.jpg', alt: 'Commercial rooftop solar mounting by Leaf Solar', caption: 'Commercial rooftop mounting' },
  { src: '/images/carousel/03-technician-harness-roof.jpg', alt: 'Leaf Solar technician wearing a safety harness during a rooftop installation', caption: 'Certified technician installation' },
  { src: '/images/carousel/04-lithium-system.jpg', alt: 'Installed lithium battery and inverter system', caption: 'Lithium battery + inverter system' },
  { src: '/images/carousel/05-panels-delivery-crew.jpg', alt: 'Leaf Solar crew delivering solar panels', caption: 'Panel delivery · Leaf Solar crew' },
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
