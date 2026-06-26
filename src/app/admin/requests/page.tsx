import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams?.status || 'all';

  const whereClause = statusFilter !== 'all' 
    ? { status: statusFilter as any }
    : {};

  const requests = await prisma.quoteRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      items: {
        include: { product: true }
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'REVIEWING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'QUOTED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CONVERTED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'REJECTED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            Inbox
            <span className="text-sm font-medium bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full">
              {requests.length} Requests
            </span>
          </h2>
          <p className="text-gray-400">Manage incoming quote requests from the storefront.</p>
        </div>
        
        <div className="flex gap-2 bg-[rgba(0,0,0,0.3)] p-1 rounded-xl border border-[rgba(255,255,255,0.05)]">
          {['all', 'PENDING', 'REVIEWING', 'QUOTED', 'CONVERTED'].map(tab => (
            <Link 
              key={tab}
              href={`/admin/requests${tab !== 'all' ? `?status=${tab}` : ''}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === tab 
                  ? 'bg-[rgba(255,255,255,0.1)] text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[rgba(255,255,255,0.05)] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Requested Item</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No requests found for this status.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {req.createdAt.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <div className="text-xs text-gray-500">{req.createdAt.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{req.client?.companyName || req.guestName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{req.client?.email || req.guestEmail || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">
                        {req.items[0]?.product?.name || 'Custom Request'}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{req.details}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link href={`/admin/requests/${req.id}`} className="text-purple-400 hover:text-purple-300 font-medium">
                        Review &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
