import { prisma } from '@/lib/prisma';
import { createQuote } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewQuotePage() {
  const clients = await prisma.client.findMany({
    take: 100,
    orderBy: { companyName: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/jobs" className="text-gray-400 hover:text-white transition-colors">
          &larr; Back
        </Link>
        <h2 className="text-3xl font-bold text-white">Generate New Quote</h2>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <form action={createQuote} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Select Client</label>
            <select 
              name="clientId" 
              required
              className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">-- Choose a Client --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.companyName || c.contactName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Job Description (Internal)</label>
            <input 
              name="description" 
              type="text" 
              required
              placeholder="e.g. 5x Pullup Banners for Expo"
              className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.1)]">
            <h3 className="text-lg font-bold text-white mb-4">Line Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Product Name</label>
                <input 
                  name="productName" 
                  type="text" 
                  required
                  placeholder="PULLUP DLX 850"
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description</label>
                <input 
                  name="itemDescription" 
                  type="text" 
                  placeholder="Deluxe pullup banner..."
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Quantity</label>
                <input 
                  name="quantity" 
                  type="number" 
                  min="1"
                  required
                  defaultValue="1"
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Unit Cost (ZAR)</label>
                <input 
                  name="unitCost" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                  placeholder="990.00"
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              Generate Quote Document
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">Quote number will be automatically generated.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
