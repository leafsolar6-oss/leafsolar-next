import type { Metadata } from 'next';
import Image from 'next/image';
import { list } from '@vercel/blob';
import { deleteCarouselImageAction, uploadCarouselImagesAction } from './actions';

export const metadata: Metadata = { title: 'Hero carousel' };

export default async function AdminCarouselPage() {
  let slides: { url: string; uploadedAt: Date }[] = [];
  let storeError: string | null = null;
  try {
    const { blobs } = await list({ prefix: 'carousel/' });
    slides = blobs
      .filter((blob) => /\.(jpe?g|png|webp)$/i.test(blob.pathname))
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? -1 : a.uploadedAt > b.uploadedAt ? 1 : 0))
      .map((blob) => ({ url: blob.url, uploadedAt: blob.uploadedAt }));
  } catch {
    storeError = 'The photo store is not reachable right now. Check the Blob configuration and try again.';
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <p className="eyebrow">Storefront hero</p>
      <h1 className="mt-2 font-display text-3xl font-black">Hero carousel photos</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
        These photos appear in the rotating carousel at the top of the homepage. Use real photos of your storefront, products and completed installations.
        The oldest photo shows first. With no photos uploaded, the homepage shows the default catalogue images.
      </p>

      {storeError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{storeError}</p>}

      <form action={uploadCarouselImagesAction} className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="files" className="block text-sm font-bold">Add photos (JPG, PNG or WebP · max 4 MB each · up to 8 at a time)</label>
        <input id="files" name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple required className="mt-3 block w-full cursor-pointer rounded-lg border border-gray-200 p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-leaf-700 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white" />
        <button type="submit" className="btn mt-4 bg-leaf-700 text-white hover:bg-leaf-800">Upload photos</button>
      </form>

      {slides.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {slides.map((slide, index) => (
            <div key={slide.url} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="relative aspect-[16/10] bg-[#f5f6f2]">
                <Image src={slide.url} alt={`Carousel photo ${index + 1}`} fill sizes="400px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <span className="text-xs font-semibold text-gray-500">Photo {index + 1} · {slide.uploadedAt.toLocaleDateString('en-NG')}</span>
                <form action={deleteCarouselImageAction}>
                  <input type="hidden" name="url" value={slide.url} />
                  <button type="submit" className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !storeError && <p className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">No carousel photos uploaded yet — the homepage is using the default catalogue images.</p>
      )}
    </div>
  );
}
