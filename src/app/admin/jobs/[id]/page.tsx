import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import JobControls from './JobControls';

export const dynamic = 'force-dynamic';

export default async function QuoteViewer({ params }: { params: Promise<{ id: string }> }) {
  let job;
  let paramsData;
  try {
    paramsData = await params;
    job = await prisma.job.findFirst({
      where: {
        OR: [
          { id: paramsData.id },
          { jobNumber: paramsData.id },
          { legacyId: paramsData.id },
          { id: `legacy-${paramsData.id}` }
        ]
      },
      include: { client: true, items: true, salesRep: true },
    });
  } catch (err: any) {
    if (err.message && err.message.includes('NEXT_HTTP_ERROR_FALLBACK')) {
      throw err; // rethrow nextjs internal errors
    }
    return (
      <div className="p-10 bg-red-900/50 text-white rounded-lg max-w-4xl mx-auto mt-20 border border-red-500 shadow-xl overflow-auto">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <span className="text-red-400">⚠️</span> Crash Detected in QuoteViewer
        </h1>
        <p className="text-red-200 mb-6 font-medium text-lg">{err.message}</p>
        <pre className="bg-black/50 p-6 rounded text-sm text-gray-300 overflow-x-auto border border-red-900/50 font-mono">
          {err.stack || JSON.stringify(err, null, 2)}
        </pre>
        <p className="mt-8 text-sm text-red-300">Please show this screen to the developer or copy the stack trace.</p>
      </div>
    );
  }

  if (!job) notFound();

  try {
    const quoteNumber = job.jobNumber || `JOB-${job.id.substring(0, 8).toUpperCase()}`;
    const quotedDate = new Date(job.createdAt).toLocaleDateString('en-GB');

    const subtotal = job.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) || job.totalAmount;

    // Parse discount from notes if stored
    const discountMatch = job.notes?.match(/Discount:\s*([\d.]+)%/);
    const discountPct = discountMatch ? parseFloat(discountMatch[1]) : 0;
    const discountAmount = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discountAmount;
    const tax = afterDiscount * 0.15;
    const total = afterDiscount + tax;

    return (
      <div className="max-w-5xl mx-auto space-y-4 pb-20 animate-fade-in">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { size: A4; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; padding: 0; }
            .print-container { width: 210mm; min-height: 297mm; margin: 0; padding: 15mm; page-break-after: always; box-sizing: border-box; }
          }
        `}} />

        {/* Back link */}
        <Link href="/admin/jobs" className="print:hidden inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs Board
        </Link>

        <div className="flex gap-3">
          {(job.status === 'PENDING' || job.status === 'QUOTED') && (
            <Link
              href={`/admin/jobs/${job.id}/edit`}
              className="print:hidden bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-white px-4 py-2 rounded-lg font-medium transition-colors border border-[rgba(255,255,255,0.1)] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Quote
            </Link>
          )}
        </div>

        {/* Controls (client component) */}
        <JobControls
          jobId={job.id}
          currentStatus={job.status as any}
          totalAmount={job.totalAmount}
          amountPaid={job.amountPaid}
          balance={job.balance}
        />

        {/* ─── Printable Quote Document ─── */}
        <div className="bg-white text-black rounded-xl shadow-2xl print:shadow-none print:rounded-none overflow-hidden print-container">
          <div className="p-10 md:p-14 print:p-0">

            {/* Header */}
            <div className="flex justify-between items-start mb-10">
              <div>
                <img src="/landscape-logo-v2.png" alt="FacePrint" className="w-[300px] mb-4 object-contain" />
                <p className="text-xs font-semibold text-gray-500 mt-1 tracking-wider uppercase">
                  VAT Number 4060259753
                </p>
                <div className="mt-5 space-y-0.5">
                  <p className="text-sm font-black uppercase tracking-wide">
                    Quote Number {quoteNumber}
                  </p>
                  <p className="text-sm font-bold italic text-red-600">
                    Quoted by {job.salesRep ? `${job.salesRep.firstName || ''} ${job.salesRep.lastName || ''}`.trim() : 'ADMIN'} ({quotedDate})
                  </p>
                </div>
              </div>

              <div className="text-right max-w-[260px]">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Customer</h2>
                <p className="text-sm font-black uppercase leading-tight">
                  {job.client?.companyName || job.client?.contactName}
                </p>
                {job.client?.companyName && (
                  <p className="text-xs text-gray-600 uppercase mt-0.5">{job.client?.contactName}</p>
                )}
                {job.client?.addressLine1 && (
                  <p className="text-xs uppercase text-gray-600 mt-1">{job.client?.addressLine1}</p>
                )}
                {(job.client?.city || job.client?.state) && (
                  <p className="text-xs uppercase text-gray-600">
                    {[job.client?.city, job.client?.state].filter(Boolean).join(', ')}
                  </p>
                )}
                <p className="text-xs font-semibold uppercase mt-1">{job.client?.email}</p>
                {job.client?.phone && (
                  <p className="text-xs text-gray-500">{job.client?.phone}</p>
                )}
                <div className="mt-2 text-xs font-bold">
                  <span className="text-gray-500">Balance: </span>
                  <span className={job.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    0/{job.amountPaid > 0 ? job.amountPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) : '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-sm mb-8 border-collapse">
              <thead>
                <tr className="border-t-2 border-b-2 border-dashed border-gray-300">
                  <th className="py-2.5 text-left font-black uppercase text-xs tracking-wider w-1/5">Product</th>
                  <th className="py-2.5 text-center font-black uppercase text-xs tracking-wider w-12">Qty</th>
                  <th className="py-2.5 text-right font-black uppercase text-xs tracking-wider w-24">Unit Cost</th>
                  <th className="py-2.5 text-right font-black uppercase text-xs tracking-wider w-28">Amount</th>
                  <th className="py-2.5 text-left font-black uppercase text-xs tracking-wider pl-6">Description</th>
                </tr>
              </thead>
              <tbody>
                {job.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 italic text-sm">
                      No line items on this job.
                    </td>
                  </tr>
                ) : (
                  job.items.map((item, i) => {
                    const parts = item.description.split(' - ');
                    const productName = parts[0];
                    const desc = parts.slice(1).join(' - ');
                    return (
                      <tr key={i} className="border-b border-dashed border-gray-200">
                        <td className="py-3 pr-3 font-semibold uppercase text-xs leading-tight">{productName}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right font-mono">
                          {item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold">
                          {(item.unitPrice * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pl-6 text-gray-600 uppercase text-xs leading-tight whitespace-pre-wrap">{desc}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t-2 border-b-2 border-dashed border-gray-300 py-3 mb-12">
              <div className="grid grid-cols-5 gap-0 text-xs">
                <div className="pr-4">
                  <p className="font-black uppercase tracking-wider mb-1">Subtotal:</p>
                  <p className="font-mono">ZAR {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="border-l border-dashed border-gray-300 px-4">
                  <p className="font-black uppercase tracking-wider mb-1">
                    Discount ({discountPct > 0 ? `${discountPct}%` : '0%'}):
                  </p>
                  <p className="font-mono">ZAR {discountAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="border-l border-dashed border-gray-300 px-4">
                  <p className="font-black uppercase tracking-wider mb-1">Deposit:</p>
                  <p className="font-mono">ZAR {job.amountPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="border-l border-dashed border-gray-300 px-4">
                  <p className="font-black uppercase tracking-wider mb-1">Tax (15%):</p>
                  <p className="font-mono">ZAR {tax.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="border-l border-dashed border-gray-300 px-4">
                  <p className="font-black uppercase tracking-wider mb-1">Total:</p>
                  <p className="font-mono font-black text-sm">ZAR {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-1 text-[10px] text-gray-700 leading-relaxed">
              <p>Pullup Print (PTY) Ltd Ta FacePrint ICK 2010/103007/23 | 5 BEACON STREET, MABONENG | NEW DOORFONTEIN,</p>
              <p>WEBSITE: www.faceprint.co.za | E-MAIL: sales@faceprint.co.za | TEL: 081 393 6500 | TEL: 078 599 9702 | CELL: 079 236 0090</p>
              <p>Full payment requirement for all orders placed unless otherwise stated. 12 Hr speed service available.</p>
              <p className="text-red-600 font-bold italic my-1">Use QUOTE NUMBER as REF on EFT payments.</p>
              <p>BANKING | <strong>FNB</strong> | FACEPRINT | <strong>62219584879</strong> | THE ROSE, CODE <strong>252942</strong> | SWIFT FIRNZAJJ</p>
              <p>BANKING | <strong>NEDBANK</strong> | FACEPRINT | <strong>1249887712</strong> | ONLINE BANKING | CODE <strong>198765</strong></p>
              <p>BANKING | <strong>STANDARD</strong> | FACEPRINT | <strong>000283916</strong> | CODE <strong>000205</strong> | SWIFT SBZAZAJJ</p>
            </div>

          </div>
        </div>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-10 bg-red-900/50 text-white rounded-lg max-w-4xl mx-auto mt-20 border border-red-500 shadow-xl overflow-auto">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-3">
          <span className="text-red-400">⚠️</span> Crash Detected in QuoteViewer
        </h1>
        <p className="text-red-200 mb-6 font-medium text-lg">{err.message}</p>
        <pre className="bg-black/50 p-6 rounded text-sm text-gray-300 overflow-x-auto border border-red-900/50 font-mono">
          {err.stack || JSON.stringify(err, null, 2)}
        </pre>
        <p className="mt-8 text-sm text-red-300">Please show this screen to the developer or copy the stack trace.</p>
      </div>
    );
  }
}
