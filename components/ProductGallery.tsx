'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatNaira } from '@/lib/data';

const fallbackImage = '/images/product-placeholder.svg';

export default function ProductGallery({ name, imageAlt, images, badge, saving }: { name: string; imageAlt: string; images: string[]; badge?: string; saving: number }) {
  const usableImages = images.filter(image => typeof image === 'string' && (image.startsWith('/') || /^https?:\/\//i.test(image)));
  const galleryImages = usableImages.length > 0 ? usableImages : [fallbackImage];
  const [selected, setSelected] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const active = galleryImages[selected] || galleryImages[0];
  const activeFailed = failedImages.includes(active);

  function markFailed(image: string) {
    setFailedImages(current => current.includes(image) ? current : [...current, image]);
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f5f6f2] sm:rounded-[1.75rem]">
        <Image
          src={activeFailed ? fallbackImage : active}
          alt={activeFailed || active === fallbackImage ? `Image unavailable for ${name}` : selected === 0 ? imageAlt : `${name} product view ${selected + 1}`}
          fill
          priority={selected === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-7 sm:p-12"
          onError={() => markFailed(active)}
        />
        {badge && <span className="absolute left-4 top-4 rounded-lg bg-leaf-700 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white sm:left-6 sm:top-6">{badge}</span>}
        {saving > 0 && <span className="absolute right-4 top-4 rounded-lg bg-sun-400 px-3 py-2 text-xs font-black text-gray-950 sm:right-6 sm:top-6">Save {formatNaira(saving)}</span>}
      </div>
      {galleryImages.length > 1 && <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product images">{galleryImages.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setSelected(index)} aria-label={`View product image ${index + 1}`} aria-current={selected === index ? 'true' : undefined} className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f5f6f2] transition ${selected === index ? 'border-leaf-700' : 'border-transparent hover:border-leaf-300'}`}><Image src={failedImages.includes(image) ? fallbackImage : image} alt="" fill sizes="80px" className="object-contain p-2" onError={() => markFailed(image)} /></button>)}</div>}
    </div>
  );
}
