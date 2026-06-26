'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createClient(formData: FormData) {
  const companyName = formData.get('companyName') as string;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const state = formData.get('state') as string;
  const addressLine1 = formData.get('addressLine1') as string;
  const city = formData.get('city') as string;

  if (!companyName || !contactName || !email || !phone || !state || !addressLine1) {
    throw new Error('Missing required fields');
  }

  const newClient = await prisma.client.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      state,
      addressLine1,
      city,
    },
  });

  revalidatePath('/admin/clients');
  redirect(`/admin/clients/${newClient.id}`);
}
