'use server';

import { del, put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isCarouselBlobUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.public.blob.vercel-storage.com') && parsed.pathname.startsWith('/carousel/');
  } catch {
    return false;
  }
}

export async function uploadCarouselImagesAction(formData: FormData) {
  await requireAdmin();
  const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) throw new Error('Choose at least one photo to upload.');
  if (files.length > 8) throw new Error('Upload at most eight photos at a time.');
  for (const file of files) {
    if (file.size > MAX_BYTES) throw new Error('Each photo must be 4 MB or smaller.');
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Use JPG, PNG or WebP photos.');
  }
  for (const file of files) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    await put(`carousel/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`, file, { access: 'public', addRandomSuffix: false });
  }
  revalidatePath('/');
  revalidatePath('/admin/carousel');
  redirect('/admin/carousel?uploaded=1');
}

export async function deleteCarouselImageAction(formData: FormData) {
  await requireAdmin();
  const url = String(formData.get('url') || '');
  if (!isCarouselBlobUrl(url)) throw new Error('This photo could not be verified as a carousel image.');
  await del(url);
  revalidatePath('/');
  revalidatePath('/admin/carousel');
  redirect('/admin/carousel?deleted=1');
}
