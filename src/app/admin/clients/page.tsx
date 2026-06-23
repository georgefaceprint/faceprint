import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ClientsDirectory({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams?.q || '';
  const currentPage = Number(searchParams?.page) || 1;
  const take = 20;
  const skip = (currentPage - 1) * take;

  const whereClause = query
    ? {
        OR: [
          { companyName: { contains: query, mode: 'insensitive' as const } },
          { contactName: { contains: query, mode: 'insensitive' as const } },
          { email: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [clients, totalClients] = await Promise.all([
    prisma.client.findMany({
      where: whereClause,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { jobs: true } }
      }
    }),
    prisma.client.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalClients / take);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Clients Directory</h2>
          <p className="text-gray-400">Manage your {totalClients.toLocaleString()} clients across Africa.</p>
        </div>
        
        {/* Search Bar - Note: We would ideally use a client component wrapper for real-time search, but native forms work too */}
        <form action="/admin/clients" method="GET" className="flex">
          <input 
            type="text" 
            name="q"
            defaultValue={query}
            placeholder="Search by name, company or email..." 
            className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-l-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-72"
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-r-xl transition-colors font-medium">
            Search
          </button>
        </form>
      </div>

      {/* Clients Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[rgba(255,255,255,0.05)] text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Company / Contact</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Contact Info</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-center">Total Jobs</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group cursor-pointer" onClick={() => {}}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{client.companyName || client.contactName}</div>
                      {client.companyName && <div className="text-xs text-gray-500">{client.contactName}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">{client.email || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{client.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300">{client.city || 'Unknown City'}</div>
                      <div className="text-gray-500 text-xs">{client.state || 'Unknown State'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-100 bg-purple-600/30 rounded-full">
                        {client._count.jobs}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/clients/${client.id}`} className="text-purple-400 hover:text-purple-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium text-white">{skip + 1}</span> to <span className="font-medium text-white">{Math.min(skip + take, totalClients)}</span> of <span className="font-medium text-white">{totalClients}</span> clients
            </div>
            <div className="flex space-x-2">
              {currentPage > 1 && (
                <Link href={`/admin/clients?page=${currentPage - 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border border-[rgba(255,255,255,0.1)] rounded-lg text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  Previous
                </Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/admin/clients?page=${currentPage + 1}${query ? `&q=${query}` : ''}`} className="px-4 py-2 border border-[rgba(255,255,255,0.1)] rounded-lg text-sm font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
