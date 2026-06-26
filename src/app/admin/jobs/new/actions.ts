'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function createQuote(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  // Generate initials from user name
  const initials = session.user.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'AD';

  // Format: YYYYMMDDHHMM + initials
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const quoteNumber = `${year}${month}${day}${hours}${minutes}${initials}`;

  const clientId = formData.get('clientId') as string;
  const description = formData.get('description') as string;
  const discount = parseFloat(formData.get('discount') as string) || 0;
  const itemCount = parseInt(formData.get('itemCount') as string, 10) || 1;

  // Parse all line items
  const lineItems = [];
  for (let i = 0; i < itemCount; i++) {
    const productName = formData.get(`item_${i}_productName`) as string;
    const itemDescription = formData.get(`item_${i}_description`) as string;
    const quantity = parseInt(formData.get(`item_${i}_quantity`) as string, 10);
    const unitCost = parseFloat(formData.get(`item_${i}_unitCost`) as string);
    lineItems.push({ productName, itemDescription, quantity, unitCost });
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const discountAmount = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * 0.15;
  const totalAmount = afterDiscount + tax;

  const job = await prisma.job.create({
    data: {
      jobNumber: quoteNumber,
      status: 'PENDING',
      salesRepId: session.user.name || 'System',
      description,
      totalAmount,
      balance: totalAmount,
      clientId,
      notes: discount > 0 ? `Discount: ${discount}%` : undefined,
      items: {
        create: lineItems.map(item => ({
          description: item.productName + (item.itemDescription ? ` - ${item.itemDescription}` : ''),
          quantity: item.quantity,
          unitPrice: item.unitCost,
          totalPrice: item.quantity * item.unitCost,
        })),
      },
    },
  });

  const requestId = formData.get('requestId') as string | null;
  if (requestId) {
    try {
      await prisma.quoteRequest.update({
        where: { id: requestId },
        data: { status: 'CONVERTED', jobId: job.id }
      });
    } catch (err) {
      console.error('Failed to link quote request:', err);
    }
  }

  redirect(`/admin/jobs/${job.id}`);
}
