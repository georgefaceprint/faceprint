import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function JobsBoard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  const whereClause = query
    ? {
        OR: [
          { jobNumber: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { id: { contains: query, mode: 'insensitive' as const } },
          { client: { companyName: { contains: query, mode: 'insensitive' as const } } },
          { client: { contactName: { contains: query, mode: 'insensitive' as const } } },
          { client: { legacyId: { contains: query, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const jobs = await prisma.job.findMany({
    where: whereClause,
    take: query ? 500 : 100, // Show more results if searching
    orderBy: { createdAt: 'desc' },
    include: { client: true }
  });

  const pendingJobs = jobs.filter(j => j.status === 'PENDING');
  const inProductionJobs = jobs.filter(j => j.status === 'IN_PRODUCTION');
  const deliveredJobs = jobs.filter(j => j.status === 'DELIVERED' || j.status === 'COMPLETED');

  const JobCard = ({ job }: { job: any }) => (
    <Link href={`/admin/jobs/${job.jobNumber || job.id}`} className="block bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl p-4 mb-3 hover:bg-[rgba(255,255,255,0.06)] transition-all cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono text-gray-500">#{job.jobNumber || job.id.substring(0, 8)}</span>
        <span className="text-xs font-semibold text-white bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded">R {job.totalAmount.toLocaleString()}</span>
      </div>
      <h4 className="font-medium text-white mb-1 group-hover:text-purple-400 transition-colors">
        {job.client?.companyName || job.client?.contactName || 'Unknown Client'}
      </h4>
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{job.description || 'No description provided.'}</p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</span>
        <span className="text-purple-400 hover:text-purple-300">View &rarr;</span>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Jobs Board</h2>
          <p className="text-gray-400">Track and manage active production jobs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form action="/admin/jobs" method="GET" className="flex">
            <input 
              type="text" 
              name="q"
              defaultValue={query}
              placeholder="Search jobs, clients, legacy IDs..." 
              className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-l-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-64 md:w-80"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-xl transition-colors font-medium text-sm">
              Search
            </button>
          </form>
          <Link href="/admin/jobs/new" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.5)] whitespace-nowrap text-sm">
            + New Quote
          </Link>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Column: Pending */}
        <div className="glass-panel rounded-2xl flex flex-col max-h-full border-t-4 border-t-orange-500">
          <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center">
            <h3 className="font-bold text-white">Pending Quotes / Jobs</h3>
            <span className="bg-[rgba(255,255,255,0.1)] text-white text-xs font-bold px-2 py-1 rounded-full">{pendingJobs.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {pendingJobs.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No pending jobs.</p> : pendingJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>

        {/* Column: In Production */}
        <div className="glass-panel rounded-2xl flex flex-col max-h-full border-t-4 border-t-blue-500">
          <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center">
            <h3 className="font-bold text-white">In Production</h3>
            <span className="bg-[rgba(255,255,255,0.1)] text-white text-xs font-bold px-2 py-1 rounded-full">{inProductionJobs.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {inProductionJobs.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No active production jobs.</p> : inProductionJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>

        {/* Column: Delivered */}
        <div className="glass-panel rounded-2xl flex flex-col max-h-full border-t-4 border-t-green-500">
          <div className="p-4 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center">
            <h3 className="font-bold text-white">Delivered / Completed</h3>
            <span className="bg-[rgba(255,255,255,0.1)] text-white text-xs font-bold px-2 py-1 rounded-full">{deliveredJobs.length}</span>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {deliveredJobs.length === 0 ? <p className="text-sm text-gray-500 text-center py-4">No recently delivered jobs.</p> : deliveredJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
