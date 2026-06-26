import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Status Breakdown
    const statusCounts = await prisma.job.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusBreakdown = statusCounts.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    // 2. Revenue By Month (Approximation in JS for cross-db compatibility)
    // Fetch jobs that are not cancelled
    const jobs = await prisma.job.findMany({
      where: {
        status: { not: 'CANCELLED' }
      },
      select: {
        createdAt: true,
        totalAmount: true,
      }
    });

    // Group by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueMap: Record<string, number> = {};

    jobs.forEach(job => {
      const d = new Date(job.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!revenueMap[key]) {
        revenueMap[key] = 0;
      }
      revenueMap[key] += job.totalAmount;
    });

    // Sort chronologically (assuming we only have a year or so of data, but let's just output the keys as they appear or sort them properly)
    const sortedKeys = Object.keys(revenueMap).sort((a, b) => {
      const [mA, yA] = a.split(' ');
      const [mB, yB] = b.split(' ');
      const dateA = new Date(parseInt(yA), monthNames.indexOf(mA));
      const dateB = new Date(parseInt(yB), monthNames.indexOf(mB));
      return dateA.getTime() - dateB.getTime();
    });

    const revenueByMonth = sortedKeys.slice(-12).map(key => ({
      month: key,
      revenue: revenueMap[key],
    }));

    return NextResponse.json({
      statusBreakdown,
      revenueByMonth
    });

  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
