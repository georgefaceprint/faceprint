import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QuoteBuilder from './QuoteBuilder';

export const dynamic = 'force-dynamic';

export default async function NewQuotePage() {
  const clients = await prisma.client.findMany({
    take: 500,
    orderBy: { companyName: 'asc' },
    select: { id: true, companyName: true, contactName: true },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-4">
        <Link href="/admin/jobs" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs Board
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white">Generate New Quote</h2>
        <p className="text-gray-400 mt-1">Add multiple line items, set a discount, and generate the quote document instantly.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <QuoteBuilder clients={clients} />
      </div>
    </div>
  );
}
