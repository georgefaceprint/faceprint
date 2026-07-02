import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PublicQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const job = await prisma.job.findFirst({
    where: {
      OR: [
        { id },
        { jobNumber: id },
        { legacyId: id },
        { id: `legacy-${id}` }
      ]
    },
    include: {
      client: true,
      items: true,
    }
  });

  if (!job) {
    notFound();
  }

  // A Job without PENDING or QUOTED is technically not just a quote, but we can show it anyway.
  const isQuote = job.status === 'PENDING' || job.status === 'QUOTED';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header/Logo */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <img src="/landscape-logo-v2.png" alt="FacePrint" className="w-[300px] object-contain" />
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-white uppercase tracking-wider">
              {isQuote ? 'Quote' : 'Invoice'}
            </h1>
            <p className="text-purple-400 font-mono mt-1">#{job.jobNumber || job.id.split('-')[0].toUpperCase()}</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10">
            {/* Status Badge */}
            <div className="mb-8">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                job.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                job.status === 'QUOTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                job.status === 'IN_PRODUCTION' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {job.status === 'PENDING' ? 'PENDING APPROVAL' : job.status.replace('_', ' ')}
              </span>
            </div>

            {/* Client & Company Info */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Prepared For</h3>
                <div className="space-y-1">
                  <p className="font-bold text-white text-lg">{job.client?.companyName || job.client?.contactName}</p>
                  {job.client?.companyName && <p className="text-gray-400">{job.client?.contactName}</p>}
                  <p className="text-gray-400">{job.client?.email}</p>
                  {job.client?.phone && <p className="text-gray-400">{job.client?.phone}</p>}
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Prepared By</h3>
                <div className="space-y-1">
                  <p className="font-bold text-white text-lg">FacePrint</p>
                  <p className="text-gray-400">sales@faceprint.co.za</p>
                  <p className="text-gray-400">011 026 1506</p>
                  <p className="text-gray-400">105 10th Ave, Edenvale</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="mb-8 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                <p className="text-sm text-gray-300">{job.description}</p>
              </div>
            )}

            {/* Line Items */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.1)] text-left">
                      <th className="py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Qty</th>
                      <th className="py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Unit Price</th>
                      <th className="py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                    {job.items.map((item) => (
                      <tr key={item.id} className="text-sm">
                        <td className="py-4 px-2 text-white font-medium">{item.description}</td>
                        <td className="py-4 px-2 text-gray-300 text-right">{item.quantity}</td>
                        <td className="py-4 px-2 text-gray-300 text-right">R {item.unitPrice.toFixed(2)}</td>
                        <td className="py-4 px-2 text-white font-bold text-right">R {item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span>R {(job.totalAmount / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>VAT (15%)</span>
                  <span>R {(job.totalAmount - (job.totalAmount / 1.15)).toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-[rgba(255,255,255,0.1)] flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    R {job.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            {isQuote && (
              <div className="mt-12 pt-8 border-t border-[rgba(255,255,255,0.1)] text-center">
                <p className="text-gray-400 text-sm mb-6">Ready to proceed? Contact your sales rep or reply to the email to approve this quote.</p>
                <div className="flex justify-center gap-4">
                  <a href={`mailto:sales@faceprint.co.za?subject=Approval%20for%20Quote%20Number%20${job.jobNumber}`} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] print:hidden">
                    Approve Quote
                  </a>
                  <PrintButton />
                  <a href="/contact" className="px-6 py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white font-semibold rounded-xl transition-all print:hidden">
                    Ask a Question
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-1 text-[10px] text-gray-400 leading-relaxed max-w-2xl mx-auto opacity-80 print:opacity-100 print:text-gray-700">
          <p>Pullup Print (PTY) Ltd Ta FacePrint ICK 2010/103007/23 | 5 BEACON STREET, MABONENG | NEW DOORFONTEIN,</p>
          <p>WEBSITE: www.faceprint.co.za | E-MAIL: sales@faceprint.co.za | TEL: 081 393 6500 | TEL: 078 599 9702 | CELL: 079 236 0090</p>
          <p>Full payment requirement for all orders placed unless otherwise stated. 12 Hr speed service available.</p>
          <p className="text-red-400 print:text-red-600 font-bold italic my-1">Use QUOTE NUMBER as REF on EFT payments.</p>
          <p>BANKING | <strong className="text-white print:text-black">FNB</strong> | FACEPRINT | <strong className="text-white print:text-black">62219584879</strong> | THE ROSE, CODE <strong className="text-white print:text-black">252942</strong> | SWIFT FIRNZAJJ</p>
          <p>BANKING | <strong className="text-white print:text-black">NEDBANK</strong> | FACEPRINT | <strong className="text-white print:text-black">1249887712</strong> | ONLINE BANKING | CODE <strong className="text-white print:text-black">198765</strong></p>
          <p>BANKING | <strong className="text-white print:text-black">STANDARD</strong> | FACEPRINT | <strong className="text-white print:text-black">000283916</strong> | CODE <strong className="text-white print:text-black">000205</strong> | SWIFT SBZAZAJJ</p>
          <p className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] text-xs text-gray-500">© {new Date().getFullYear()} FacePrint. This is a computer generated document.</p>
        </div>

      </div>
    </div>
  );
}
