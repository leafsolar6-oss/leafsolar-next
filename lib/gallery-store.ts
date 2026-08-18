import 'server-only';

import { list } from '@vercel/blob';

import { DEFAULT_HERO_SLIDES, type CarouselSlide } from '@/lib/carousel-store';

/**
 * Installation gallery. Owner-uploaded photos live in the Vercel Blob store
 * under the `gallery/` prefix and are managed from /admin/gallery.
 * Fallback chain: gallery/ uploads -> carousel/ uploads -> bundled photos,
 * so the page always has real imagery to show.
 */

export async function getGallerySlides(): Promise<CarouselSlide[]> {
  try {
    const { blobs } = await list({ prefix: 'gallery/' });
    const images = blobs
      .filter((blob) => /\.(jpe?g|png|webp)$/i.test(blob.pathname))
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : a.uploadedAt > b.uploadedAt ? -1 : 0)) // newest first for the gallery
      .map((blob) => ({ src: blob.url, alt: 'Leaf Solar installation photo' }));
    if (images.length > 0) return images;
  } catch { /* fall through */ }
  try {
    const { blobs } = await list({ prefix: 'carousel/' });
    const images = blobs
      .filter((blob) => /\.(jpe?g|png|webp)$/i.test(blob.pathname))
      .map((blob) => ({ src: blob.url, alt: 'Leaf Solar installation photo' }));
    if (images.length > 0) return images;
  } catch { /* fall through */ }
  return DEFAULT_HERO_SLIDES;
}
