import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { companyName: { contains: query, mode: 'insensitive' } },
          { contactName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { legacyId: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { companyName: 'asc' },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        email: true,
        legacyId: true,
        city: true,
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Client search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
