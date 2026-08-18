'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Slide = { src: string; alt: string; caption?: string };

const INTERVAL_MS = 3000;

/**
 * Accessible auto-advancing hero carousel.
 * - Auto-plays every 5s, pauses on hover/touch, resumes on leave
 * - Respects prefers-reduced-motion (no auto-advance)
 * - Swipe support on touch devices, arrows + dots for everyone
 */
export default function HeroCarousel({ slides, className }: { slides: Slide[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;

  const onPointerDown = (x: number) => { touchStartX.current = x; setPaused(true); };
  const onPointerUp = (x: number) => {
    if (touchStartX.current !== null) {
      const delta = x - touchStartX.current;
      if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    setPaused(false);
  };

  return (
    <div
      className={`group/carousel relative select-none ${className || ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); touchStartX.current = null; }}
      onTouchStart={(e) => onPointerDown(e.touches[0]?.clientX ?? 0)}
      onTouchEnd={(e) => onPointerUp(e.changedTouches[0]?.clientX ?? 0)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Leaf Solar showcase"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center lg:object-contain lg:p-3"
            draggable={false}
          />
        </div>
      ))}

      {slides[index]?.caption && (
        <div className="pointer-events-none absolute bottom-10 left-3 z-10 hidden max-w-[70%] lg:block">
          <span className="inline-block rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white backdrop-blur">
            {slides[index].caption}
          </span>
        </div>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/60 sm:left-3 sm:h-10 sm:w-10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/60 sm:right-3 sm:h-10 sm:w-10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
