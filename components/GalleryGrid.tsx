'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

export type GalleryPhoto = { src: string; alt: string };

/**
 * Responsive photo grid with a dependency-free lightbox:
 * click to open full view, arrows or swipe to browse, Esc/backdrop to close.
 */
export default function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((delta: number) => {
    setOpen((current) => (current === null ? current : (current + delta + photos.length) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setOpen(index)}
            aria-label={`Open photo ${index + 1}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-[#f5f6f2]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous photo" className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:left-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="relative h-[70vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[open].src} alt={photos[open].alt} fill sizes="100vw" className="rounded-2xl object-contain" />
            <p className="absolute inset-x-0 bottom-3 text-center text-xs font-bold text-white/80">{open + 1} / {photos.length}</p>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next photo" className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:right-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
