import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:       { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Pending' },
  QUOTED:        { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Quoted' },
  INVOICED:      { bg: 'bg-indigo-500/20', text: 'text-indigo-400', label: 'Invoiced' },
  IN_PRODUCTION: { bg: 'bg-cyan-500/20',   text: 'text-cyan-400',   label: 'In Production' },
  COMPLETED:     { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Completed' },
  DELIVERED:     { bg: 'bg-green-500/20',  text: 'text-green-400',  label: 'Delivered' },
  CANCELLED:     { bg: 'bg-red-500/20',    text: 'text-red-400',    label: 'Cancelled' },
};

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { id: true } } },
      },
    },
  });

  if (!client) notFound();

  const totalRevenue = client.jobs
    .filter(j => j.status !== 'CANCELLED')
    .reduce((sum, j) => sum + j.totalAmount, 0);

  const totalPaid = client.jobs.reduce((sum, j) => sum + j.amountPaid, 0);
  const outstanding = client.jobs.reduce((sum, j) => sum + j.balance, 0);
  const jobCount = client.jobs.length;
  const activeJobs = client.jobs.filter(j => j.status === 'IN_PRODUCTION' || j.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* Back */}
      <Link href="/admin/clients" className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </Link>

      {/* Header Card */}
      <div className="glass-panel rounded-2xl p-8 border border-[rgba(255,255,255,0.1)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
              {(client.companyName || client.contactName).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {client.companyName || client.contactName}
              </h2>
              {client.companyName && (
                <p className="text-gray-400 mt-0.5">{client.contactName}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="hover:text-purple-400 transition-colors flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone}`} className="hover:text-purple-400 transition-colors flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {client.phone}
                  </a>
                )}
                {(client.city || client.state) && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {[client.city, client.state].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick action */}
          <Link
            href={`/admin/jobs/new`}
            className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.4)] whitespace-nowrap"
          >
            + New Quote for Client
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-purple-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Jobs</p>
          <p className="text-3xl font-black text-white">{jobCount}</p>
          {activeJobs > 0 && (
            <p className="text-xs text-cyan-400 mt-1">{activeJobs} active</p>
          )}
        </div>
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-cyan-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-black text-white">R {totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-green-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Amount Paid</p>
          <p className="text-2xl font-black text-green-400">R {totalPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-orange-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
          <p className={`text-2xl font-black ${outstanding > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            R {outstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Address details (if any) */}
      {(client.addressLine1 || client.vatNumber) && (
        <div className="glass-panel rounded-xl p-5 border border-[rgba(255,255,255,0.08)]">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Business Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {client.addressLine1 && (
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Address</p>
                <p className="text-gray-200">{client.addressLine1}</p>
                {client.addressLine2 && <p className="text-gray-300">{client.addressLine2}</p>}
                <p className="text-gray-300">{[client.city, client.state, client.postalCode].filter(Boolean).join(', ')}</p>
              </div>
            )}
            {client.vatNumber && (
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">VAT Number</p>
                <p className="text-gray-200 font-mono">{client.vatNumber}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Client Since</p>
              <p className="text-gray-200">{new Date(client.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Job History */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
          <h3 className="text-xl font-bold text-white">Job History</h3>
          <p className="text-gray-400 text-sm mt-0.5">{jobCount} total jobs</p>
        </div>

        {client.jobs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            No jobs found for this client.
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {client.jobs.map(job => {
              const badge = STATUS_BADGE[job.status] || STATUS_BADGE['PENDING'];
              return (
                <Link
                  key={job.id}
                  href={`/admin/jobs/${job.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-500">
                        #{job.jobNumber || job.id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                      {job.description || 'No description'}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{job.items.length} item{job.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-white font-bold">
                      R {job.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </p>
                    {job.balance > 0 && (
                      <p className="text-orange-400 text-xs">R {job.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} due</p>
                    )}
                    {job.balance === 0 && job.amountPaid > 0 && (
                      <p className="text-green-400 text-xs">Paid</p>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-purple-400 ml-3 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
