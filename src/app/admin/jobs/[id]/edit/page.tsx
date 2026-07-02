import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QuoteBuilder from '../../new/QuoteBuilder';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  let job;
  let paramsData;
  let products;

  try {
    paramsData = await params;
    
    [job, products] = await Promise.all([
      prisma.job.findFirst({
        where: { 
          OR: [
            { id: paramsData.id },
            { jobNumber: paramsData.id },
            { legacyId: paramsData.id },
            { id: `legacy-${paramsData.id}` }
          ]
        },
        include: {
          client: true,
          items: true,
        }
      }),
      prisma.product.findMany({
        take: 2000,
        orderBy: { name: 'asc' },
        select: { id: true, name: true, basePrice: true, description: true },
      })
    ]);
  } catch (err: any) {
    if (err.message && err.message.includes('NEXT_HTTP_ERROR_FALLBACK')) throw err;
    return (
      <div className="p-8 text-red-500 bg-red-100 rounded">
        Error loading job: {err.message}
      </div>
    );
  }

  if (!job) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-4">
        <Link href={`/admin/jobs/${job.id}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancel Editing
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white">Edit Quote {job.jobNumber}</h2>
        <p className="text-gray-400 mt-1">Modify line items, quantities, and discounts.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl relative">
        <QuoteBuilder 
          lockedClient={job.client} 
          products={products} 
          existingJob={job}
        />
      </div>
    </div>
  );
}
