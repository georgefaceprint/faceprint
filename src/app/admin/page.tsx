import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Parallel fetching for performance
  const [clientCount, jobCount, pendingJobs, totalRevenueAgg] = await Promise.all([
    prisma.client.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'PENDING' } }),
    prisma.job.aggregate({
      _sum: { totalAmount: true }
    })
  ]);

  const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

  // Recent jobs
  const recentJobs = await prisma.job.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { client: true }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, George</h2>
        <p className="text-gray-400">Here's what's happening with FacePrint today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-purple-500">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Clients</p>
          <p className="text-3xl font-bold text-white">{clientCount.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-cyan-500">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Jobs</p>
          <p className="text-3xl font-bold text-white">{jobCount.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-orange-500">
          <p className="text-sm font-medium text-gray-400 mb-1">Pending Jobs</p>
          <p className="text-3xl font-bold text-white">{pendingJobs.toLocaleString()}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-white">R {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Recent Jobs</h3>
          <Link href="/admin/jobs" className="text-sm text-purple-400 hover:text-purple-300">View all &rarr;</Link>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.05)]">
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No jobs found yet. Waiting for migration to sync.</div>
          ) : (
            recentJobs.map((job) => (
              <div key={job.id} className="p-6 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <div>
                  <p className="text-white font-medium">{job.client.companyName || job.client.contactName}</p>
                  <p className="text-sm text-gray-400">{job.description || 'No description provided'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                    ${job.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' : ''}
                    ${job.status === 'IN_PRODUCTION' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${job.status === 'DELIVERED' || job.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : ''}
                  `}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <p className="text-white font-medium mt-1">R {job.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
