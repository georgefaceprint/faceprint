import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QuoteBuilder from './QuoteBuilder';
import ClientSelector from '@/components/ClientSelector';

export const dynamic = 'force-dynamic';

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ requestId?: string, productId?: string, qty?: string, clientId?: string }> }) {
  const params = await searchParams;
  
  const [lockedClient, products] = await Promise.all([
    params.clientId ? prisma.client.findUnique({
      where: { id: params.clientId },
      select: { id: true, companyName: true, contactName: true, legacyId: true, vatNumber: true },
    }) : null,
    prisma.product.findMany({
      take: 2000,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, basePrice: true, description: true },
    })
  ]);

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

      {!params.clientId || !lockedClient ? (
        <ClientSelector />
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl relative">
          <QuoteBuilder 
            lockedClient={lockedClient} 
            products={products} 
            initialProductId={params.productId}
            initialQty={params.qty}
            requestId={params.requestId}
          />
        </div>
      )}
    </div>
  );
}
