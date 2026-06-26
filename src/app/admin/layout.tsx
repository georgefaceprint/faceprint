import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminNav from './AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userName = session?.user?.name || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Assign avatar gradient by name
  const avatarGradients: Record<string, string> = {
    G: 'from-blue-500 to-indigo-600',
    T: 'from-purple-500 to-pink-600',
    C: 'from-emerald-400 to-cyan-500',
  };
  const avatarColor = avatarGradients[userInitials[0]] || 'from-purple-600 to-cyan-500';

  return (
    <div className="min-h-screen flex bg-[#0B0F19] print:bg-white">

      {/* ── Sidebar ── */}
      <aside className="w-64 border-r border-[rgba(255,255,255,0.1)] glass-panel hidden md:flex flex-col print:hidden flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
          <Link href="/" className="block">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              FacePrint
            </span>
            <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
              ERP System
            </span>
          </Link>
        </div>

        {/* Nav — client component for active states */}
        <AdminNav />

        {/* User profile */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 px-2">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden print:overflow-visible">

        {/* Top header */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.1)] glass-panel flex items-center justify-between px-6 z-10 print:hidden flex-shrink-0">
          {/* Mobile menu placeholder (AdminNav handles mobile) */}
          <div className="md:hidden">
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              FacePrint ERP
            </span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link
              href="/admin/jobs/new"
              className="hidden sm:flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_12px_rgba(139,92,246,0.4)]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Quote
            </Link>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-5 pointer-events-none" />
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden border-t border-[rgba(255,255,255,0.1)] glass-panel flex print:hidden flex-shrink-0">
          <Link href="/admin" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400 hover:text-white transition-colors text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link href="/admin/clients" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400 hover:text-white transition-colors text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Clients
          </Link>
          <Link href="/admin/inventory" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400 hover:text-white transition-colors text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Inventory
          </Link>
          <Link href="/admin/jobs" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400 hover:text-white transition-colors text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Jobs
          </Link>

          <Link href="/admin/reports/daily" className="flex-1 flex flex-col items-center py-3 gap-1 text-gray-400 hover:text-white transition-colors text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Report
          </Link>
          <Link href="/admin/jobs/new" className="flex-1 flex flex-col items-center py-3 gap-1 text-purple-400 hover:text-purple-300 transition-colors text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Quote
          </Link>
        </nav>
      </div>
    </div>
  );
}
