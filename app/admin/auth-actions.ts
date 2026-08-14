'use server';

import { redirect } from 'next/navigation';
import { clearAdminSession, requestAdminLoginCode, verifyAdminLoginCode } from '@/lib/admin-auth';

function loginError(message: string, email = '') {
  return `/admin/login?error=${encodeURIComponent(message)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
}

export async function requestCodeAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect(loginError('Enter the email address for your Leaf Solar owner account.'));

  let result: Awaited<ReturnType<typeof requestAdminLoginCode>>;
  try {
    result = await requestAdminLoginCode(email);
  } catch (error) {
    console.error('Admin login request failed', error);
    redirect(loginError('We could not send a sign-in code. Please try again.', email));
  }
  if (!result.ok) redirect(loginError(result.error, email));
  redirect(`/admin/login?step=verify&email=${encodeURIComponent(email)}&sent=1`);
}

export async function verifyCodeAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const code = String(formData.get('code') || '').trim();
  let result: Awaited<ReturnType<typeof verifyAdminLoginCode>>;
  try {
    result = await verifyAdminLoginCode(email, code);
  } catch (error) {
    console.error('Admin login verification failed', error);
    redirect(`/admin/login?step=verify&email=${encodeURIComponent(email)}&error=${encodeURIComponent('We could not verify the code. Please try again.')}`);
  }
  if (!result.ok) redirect(`/admin/login?step=verify&email=${encodeURIComponent(email)}&error=${encodeURIComponent(result.error)}`);
  redirect('/admin');
}

export async function logoutAction() {
  await clearAdminSession();
  redirect('/admin/login');
}
