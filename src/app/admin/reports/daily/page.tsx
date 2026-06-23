import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  PENDING:       { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  QUOTED:        { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  INVOICED:      { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  IN_PRODUCTION: { bg: 'bg-cyan-500/20',   text: 'text-cyan-400'   },
  COMPLETED:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  DELIVERED:     { bg: 'bg-green-500/20',  text: 'text-green-400'  },
  CANCELLED:     { bg: 'bg-red-500/20',    text: 'text-red-400'    },
};

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  // Default to today, allow overriding via ?date=YYYY-MM-DD
  const targetDateStr = resolvedSearchParams?.date || new Date().toISOString().split('T')[0];
  const targetDate = new Date(targetDateStr);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const jobs = await prisma.job.findMany({
    where: {
      createdAt: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      client: { select: { companyName: true, contactName: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
  });

  // Summary stats
  const totalQuoted = jobs.reduce((sum, j) => sum + j.totalAmount, 0);
  const totalPaid   = jobs.reduce((sum, j) => sum + j.amountPaid, 0);
  const totalBalance = jobs.reduce((sum, j) => sum + j.balance, 0);
  const cancelledJobs = jobs.filter(j => j.status === 'CANCELLED');
  const activeJobs    = jobs.filter(j => j.status !== 'CANCELLED');

  // Format date nicely
  const displayDate = targetDate.toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Date nav helpers
  const prevDate = new Date(targetDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const isToday = targetDateStr === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Daily Report</h2>
          <p className="text-gray-400 mt-1">{displayDate}</p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/reports/daily?date=${prevDate.toISOString().split('T')[0]}`}
            className="glass-panel border border-[rgba(255,255,255,0.1)] px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

          <form method="GET" action="/admin/reports/daily" className="flex">
            <input
              type="date"
              name="date"
              defaultValue={targetDateStr}
              className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              onChange={e => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/admin/reports/daily?date=${e.target.value}`;
                }
              }}
            />
          </form>

          {!isToday && (
            <Link
              href={`/admin/reports/daily?date=${nextDate.toISOString().split('T')[0]}`}
              className="glass-panel border border-[rgba(255,255,255,0.1)] px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}

          {!isToday && (
            <Link
              href="/admin/reports/daily"
              className="text-sm text-purple-400 hover:text-purple-300 px-3 py-2 rounded-xl hover:bg-purple-500/10 transition-all whitespace-nowrap"
            >
              Today
            </Link>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-purple-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Jobs Today</p>
          <p className="text-3xl font-black text-white">{jobs.length}</p>
          <p className="text-xs text-gray-500 mt-1">{cancelledJobs.length} cancelled</p>
        </div>
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-cyan-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Quoted</p>
          <p className="text-xl font-black text-white">R {totalQuoted.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-green-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payments Received</p>
          <p className="text-xl font-black text-green-400">R {totalPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-panel rounded-xl p-5 border-l-4 border-l-orange-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
          <p className={`text-xl font-black ${totalBalance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
            R {totalBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {activeJobs.length} Job{activeJobs.length !== 1 ? 's' : ''} Quoted Today
          </h3>
          <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-all print:hidden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="p-16 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No jobs quoted on this day</p>
            <p className="text-gray-600 text-sm mt-1">Try a different date or create a new quote.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-[rgba(255,255,255,0.04)] text-gray-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold tracking-wider">Time</th>
                    <th className="px-6 py-3 font-semibold tracking-wider">Quote #</th>
                    <th className="px-6 py-3 font-semibold tracking-wider">Client</th>
                    <th className="px-6 py-3 font-semibold tracking-wider">Description</th>
                    <th className="px-6 py-3 font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-3 font-semibold tracking-wider text-right">Amount</th>
                    <th className="px-6 py-3 font-semibold tracking-wider text-right">Paid</th>
                    <th className="px-6 py-3 font-semibold tracking-wider text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {jobs.map(job => {
                    const badge = STATUS_BADGE[job.status] || STATUS_BADGE['PENDING'];
                    return (
                      <tr key={job.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                          {new Date(job.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                          {job.jobNumber || job.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                          {job.client.companyName || job.client.contactName}
                        </td>
                        <td className="px-6 py-4 text-gray-400 max-w-[200px] truncate">
                          {job.description || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                            {job.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-semibold text-white whitespace-nowrap">
                          R {job.totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-green-400 whitespace-nowrap">
                          {job.amountPaid > 0 ? `R ${job.amountPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono whitespace-nowrap">
                          <Link
                            href={`/admin/jobs/${job.id}`}
                            className={`hover:underline ${job.balance > 0 ? 'text-orange-400' : 'text-green-400'}`}
                          >
                            {job.balance > 0
                              ? `R ${job.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                              : 'PAID'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer totals row */}
                <tfoot className="border-t-2 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)]">
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Totals ({activeJobs.length} active)
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-white">
                      R {totalQuoted.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-green-400">
                      R {totalPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-black text-orange-400">
                      R {totalBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
