import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientDashboard() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get('client_session')?.value;

  if (!clientId) return null;

  const jobs = await prisma.job.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Your Orders & Quotes</h1>
        <Link href="/products" className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white text-sm font-semibold rounded-lg transition-colors">
          Request New Quote
        </Link>
      </div>

      <div className="glass-panel p-1 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl overflow-hidden bg-[rgba(255,255,255,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.1)]">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Number</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    You have no quotes or orders yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="p-4 font-mono text-sm text-purple-300">
                      {job.jobNumber || job.id.split('-')[0].toUpperCase()}
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-300 max-w-[200px] truncate" title={job.description || 'Items'}>
                      {job.description || (job.items.length > 0 ? job.items.map(i => i.description).join(', ') : 'No description')}
                    </td>
                    <td className="p-4 text-sm font-semibold text-white">
                      R {job.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${
                        job.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        job.status === 'QUOTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        job.status === 'IN_PRODUCTION' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {job.status === 'PENDING' ? 'QUOTE' : job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/quotes/${job.id}`} className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors">
                        View Document &rarr;
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
