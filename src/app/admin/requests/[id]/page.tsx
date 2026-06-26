import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusUpdater from './StatusUpdater';

export const dynamic = 'force-dynamic';

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const req = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      client: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!req) notFound();

  const requestedItem = req.items[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-4">
        <Link href="/admin/requests" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inbox
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Quote Request Details</h2>
          <p className="text-gray-400 mt-1">Submitted on {req.createdAt.toLocaleString('en-ZA')}</p>
        </div>
        
        <StatusUpdater requestId={req.id} currentStatus={req.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details */}
        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-xl">
          <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Customer Information
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Name / Company</div>
              <div className="text-white font-medium text-base">{req.client?.companyName || req.guestName || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Email Address</div>
              <div className="text-white">{req.client?.email || req.guestEmail || 'No email provided'}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Phone Number</div>
              <div className="text-white">{req.client?.phone || req.guestPhone || 'No phone provided'}</div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-xl">
          <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Requested Product
          </h3>
          <div className="space-y-4 text-sm">
            {requestedItem?.product ? (
              <>
                <div>
                  <div className="text-gray-500 mb-1">Product Name</div>
                  <div className="text-white font-medium text-base">{requestedItem.product.name}</div>
                  <div className="text-xs font-mono text-cyan-500 mt-1">{requestedItem.product.sku}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Base Price</div>
                  <div className="text-white">R {requestedItem.product.basePrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                </div>
              </>
            ) : (
              <div className="text-gray-400 italic">Custom product or general inquiry.</div>
            )}
            <div>
              <div className="text-gray-500 mb-1">Requested Quantity</div>
              <div className="text-white font-bold">{requestedItem?.quantity || 1} units</div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Details */}
      <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Customer Message / Requirements</h3>
        <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-xl text-gray-300 leading-relaxed whitespace-pre-wrap border border-[rgba(255,255,255,0.05)]">
          {req.details || 'No additional details provided.'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <Link 
          href={`/admin/jobs/new?requestId=${req.id}&productId=${requestedItem?.product?.id || ''}&qty=${requestedItem?.quantity || 1}`}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Convert to Quote / Job
        </Link>
      </div>
    </div>
  );
}
