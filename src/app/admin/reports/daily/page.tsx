import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import Link from 'next/link';
import DailyPrintButton from '@/components/DailyPrintButton';

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
  searchParams: Promise<{ date?: string, range?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  // Date range logic
  const now = new Date();
  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  let endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const range = resolvedSearchParams?.range || 'today';
  let displayTitle = 'Daily Report';

  if (range === 'yesterday') {
    startDate.setDate(startDate.getDate() - 1);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    displayTitle = 'Yesterday\'s Report';
  } else if (range === 'this_week') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    startDate.setDate(diff);
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    displayTitle = 'This Week\'s Report';
  } else if (range === 'last_week') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1) - 7;
    startDate.setDate(diff);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    displayTitle = 'Last Week\'s Report';
  } else if (range === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    displayTitle = 'This Month\'s Report';
  } else if (resolvedSearchParams?.date) {
    startDate = new Date(resolvedSearchParams.date);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    displayTitle = `Report for ${startDate.toLocaleDateString('en-ZA')}`;
  }

  const jobs = await prisma.job.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: { createdAt: 'desc' },
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

  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">{displayTitle}</h2>
            <p className="text-gray-400 mt-1">
              {startDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} 
              {range !== 'today' && range !== 'yesterday' && !resolvedSearchParams?.date && ` - ${new Date(endDate.getTime() - 1).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`}
            </p>
          </div>
          <DailyPrintButton />
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Link href="/admin/reports/daily?range=today" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === 'today' && !resolvedSearchParams?.date ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}>
            Today
          </Link>
          <Link href="/admin/reports/daily?range=yesterday" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === 'yesterday' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}>
            Yesterday
          </Link>
          <Link href="/admin/reports/daily?range=this_week" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === 'this_week' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}>
            This Week
          </Link>
          <Link href="/admin/reports/daily?range=last_week" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === 'last_week' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}>
            Last Week
          </Link>
          <Link href="/admin/reports/daily?range=this_month" className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${range === 'this_month' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-[rgba(255,255,255,0.05)] text-gray-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}>
            This Month
          </Link>
          
          <div className="h-6 w-px bg-[rgba(255,255,255,0.1)] mx-2"></div>

          <form method="GET" action="/admin/reports/daily" className="flex items-center gap-2">
            <input
              type="date"
              name="date"
              defaultValue={resolvedSearchParams?.date || ''}
              className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button type="submit" className="glass-panel border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all text-sm">
              Custom Date
            </button>
          </form>
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
          <DailyPrintButton />
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
                          <a href={`/admin/jobs/${job.jobNumber || job.id}`} className="hover:text-purple-400 hover:underline transition-colors font-bold">
                            {job.jobNumber || `LEGACY-${job.legacyId}`}
                          </a>
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
                            href={`/admin/jobs/${job.jobNumber || job.id}`}
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
