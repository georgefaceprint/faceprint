'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type JobStatus = 'PENDING' | 'QUOTED' | 'INVOICED' | 'IN_PRODUCTION' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  await prisma.job.update({
    where: { id: jobId },
    data: { status },
  });

  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath('/admin/jobs');
  revalidatePath('/admin');
}

export async function recordPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  const jobId = formData.get('jobId') as string;
  const amount = parseFloat(formData.get('amount') as string);

  if (!jobId || isNaN(amount) || amount <= 0) {
    throw new Error('Invalid payment data');
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('Job not found');

  const newAmountPaid = job.amountPaid + amount;
  const newBalance = Math.max(0, job.totalAmount - newAmountPaid);
  const newStatus = newBalance === 0 ? ('DELIVERED' as const) : job.status;

  await prisma.job.update({
    where: { id: jobId },
    data: {
      amountPaid: newAmountPaid,
      balance: newBalance,
      status: newStatus,
    },
  });

  revalidatePath(`/admin/jobs/${jobId}`);
}
