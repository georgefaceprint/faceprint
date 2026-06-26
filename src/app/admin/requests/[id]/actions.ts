'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateRequestStatus(requestId: string, status: any) {
  await prisma.quoteRequest.update({
    where: { id: requestId },
    data: { status }
  });
  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath('/admin/requests');
}
