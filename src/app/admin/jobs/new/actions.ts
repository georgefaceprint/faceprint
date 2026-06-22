'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function createQuote(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  // Generate initials
  const initials = session.user.name 
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'AD'; // Default

  // Format YYYYMMDDHHMM
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const quoteNumber = `${year}${month}${day}${hours}${minutes}${initials}`;

  const clientId = formData.get('clientId') as string;
  const description = formData.get('description') as string;

  // We are keeping it simple for the demo: 1 line item
  const productName = formData.get('productName') as string;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const unitCost = parseFloat(formData.get('unitCost') as string);
  const itemDescription = formData.get('itemDescription') as string;

  const totalAmount = quantity * unitCost;

  const job = await prisma.job.create({
    data: {
      jobNumber: quoteNumber,
      status: 'PENDING',
      salesRepId: session.user.name || 'System',
      description,
      totalAmount,
      balance: totalAmount,
      clientId,
      items: {
        create: {
          description: `${productName} - ${itemDescription}`,
          quantity,
          unitPrice: unitCost,
          totalPrice: totalAmount,
        }
      }
    }
  });

  redirect(`/admin/jobs/${job.id}`);
}
