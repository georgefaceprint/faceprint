import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#0B0F19] print:bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[rgba(255,255,255,0.1)] glass-panel hidden md:flex flex-col print:hidden">
        <div className="p-6 border-b border-[rgba(255,255,255,0.1)]">
          <Link href="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            FacePrint ERP
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-3 rounded-xl text-gray-300 hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/jobs" className="block px-4 py-3 rounded-xl text-gray-300 hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors">
            Jobs Board
          </Link>
          <Link href="/admin/clients" className="block px-4 py-3 rounded-xl text-gray-300 hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-colors">
            Clients Directory
          </Link>
        </nav>
        <div className="p-6 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              G
            </div>
            <div>
              <p className="text-sm font-medium text-white">George</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden print:overflow-visible">
        {/* Top Header */}
        <header className="h-20 border-b border-[rgba(255,255,255,0.1)] glass-panel flex items-center justify-between px-8 z-10 print:hidden">
          <h1 className="text-xl font-semibold text-white">Administration</h1>
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors w-64"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          {/* Subtle background glow for content area */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-10 pointer-events-none"></div>
          {children}
        </main>
      </div>
    </div>
  );
}
