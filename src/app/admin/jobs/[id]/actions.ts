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

import { sendEmail } from '@/lib/email';
import { generateQuotePdf } from '@/lib/pdf';

export async function sendQuoteEmail(jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { client: true, items: true }
  });

  if (!job) throw new Error('Job not found');
  if (!job.client?.email) throw new Error('Client has no email address');

  const totalAmount = job.totalAmount;
  const pdfBuffer = await generateQuotePdf(job);
    const quoteUrl = `https://faceprint-app.vercel.app/quotes/${job.jobNumber || job.id}`;
    
  await sendEmail({
    to: job.client.email,
    subject: `Your Quote from FacePrint (${job.jobNumber})`,
    html: `
        Good Day <strong>${job.client.companyName || job.client.contactName || 'Customer'}</strong><br><br>
        Your Quote <a href="${quoteUrl}">(<strong>${job.jobNumber}</strong>)</a> has been captured successfully. Use the Quote/Invoice number for details.<br><br>
        To view online copy, click the link below:<br>
        <strong><a href="${quoteUrl}">${quoteUrl}</a></strong><br><br>
        This was a transaction of R${totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}.<br><br>
        <img src="https://faceprint-app.vercel.app/images/cherine_avatar.png" style="width:300px; object-fit:contain;" /><br><br>
        We appreciate your business.
      `,
    attachments: [
      {
        filename: `${job.jobNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }
    ]
  });
}
