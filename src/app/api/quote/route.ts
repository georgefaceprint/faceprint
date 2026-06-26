import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { guestName, guestEmail, guestPhone, details, productId, quantity } = data;

    if (!guestName || !guestEmail || !details || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        guestName,
        guestEmail,
        guestPhone,
        details,
        status: 'PENDING',
        items: {
          create: [
            {
              productId,
              quantity: parseInt(quantity, 10) || 1,
            }
          ]
        }
      }
    });

    return NextResponse.json({ success: true, quoteRequest });
  } catch (error) {
    console.error('Error creating quote request:', error);
    return NextResponse.json({ error: 'Failed to create quote request' }, { status: 500 });
  }
}
