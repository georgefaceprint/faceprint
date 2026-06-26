import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { logoutClient } from './login/actions';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const clientId = cookieStore.get('client_session')?.value;

  if (!clientId) {
    redirect('/client/login');
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId }
  });

  if (!client) {
    redirect('/client/login');
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-purple-500/30">
      <nav className="border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/client" className="flex items-center gap-3 group">
                <img src="/images/logo-icon.png" alt="FacePrint" className="h-8 w-8 group-hover:scale-105 transition-transform" />
                <span className="font-bold text-lg tracking-wide text-white">Client Portal</span>
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">Signed in as <strong className="text-white">{client.email}</strong></span>
              <form action={logoutClient}>
                <button type="submit" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
