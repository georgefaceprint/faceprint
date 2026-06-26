'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginClient(prevState: any, formData: FormData) {
  const email = formData.get('email')?.toString().trim();
  
  if (!email) {
    return { error: 'Please enter a valid email address.' };
  }

  const client = await prisma.client.findUnique({
    where: { email }
  });

  if (!client) {
    return { error: 'No account found with that email address.' };
  }

  // Create a secure session cookie
  const cookieStore = await cookies();
  cookieStore.set('client_session', client.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  redirect('/client');
}

export async function logoutClient() {
  const cookieStore = await cookies();
  cookieStore.delete('client_session');
  redirect('/client/login');
}
