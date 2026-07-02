import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    // Return the latest 5 jobs to see what IDs actually exist
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, jobNumber: true }
    });
    return NextResponse.json({ latest: jobs });
  }

  const job = await prisma.job.findFirst({
    where: {
      OR: [
        { id },
        { jobNumber: id },
        { legacyId: id },
        { id: `legacy-${id}` }
      ]
    },
    include: { client: true, items: true }
  });

  return NextResponse.json({ job });
}
