import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function QuoteViewer({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      items: true,
    }
  });

  if (!job) {
    notFound();
  }

  // Fallbacks if data is missing
  const quoteNumber = job.jobNumber || `JOB-${job.id.substring(0, 8).toUpperCase()}`;
  const quotedBy = job.salesRepId || 'ADMIN'; // Would ideally fetch user name
  const quotedDate = new Date(job.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY
  const subtotal = job.totalAmount; // Assuming totalAmount is subtotal for now if no tax stored, wait, let's calculate from items
  
  const calculatedSubtotal = job.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || job.totalAmount;
  const tax = calculatedSubtotal * 0.15;
  const total = calculatedSubtotal + tax;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Controls - Hidden when printing */}
      <div className="flex justify-between items-center print:hidden">
        <Link href="/admin/jobs" className="text-gray-400 hover:text-white transition-colors">
          &larr; Back to Jobs
        </Link>
        <div className="space-x-4">
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg"
            onClick="window.print()" // Note: we'll convert this button to a client component below or just use a small inline script
          >
            <span className="hidden">Print</span>
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
            Edit Job
          </button>
        </div>
      </div>

      {/* The Printable Quote Document */}
      <div className="bg-white text-black p-10 md:p-16 rounded-xl shadow-2xl print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-gray-800 tracking-wide uppercase">Faceprint Quote</h1>
            <p className="text-sm font-semibold text-gray-600">VAT NUMBER 4060259753</p>
            <div className="mt-4">
              <p className="text-sm font-bold">QUOTE NUMBER {quoteNumber}</p>
              <p className="text-sm font-bold italic text-red-600">QUOTED by {quotedBy} ({quotedDate})</p>
            </div>
          </div>
          <div className="text-right space-y-1 max-w-xs">
            <h2 className="text-lg font-bold uppercase mb-2">Customer</h2>
            <p className="text-sm font-bold uppercase">{job.client.companyName || job.client.contactName}</p>
            <p className="text-sm uppercase text-gray-700">{job.client.addressLine1 || ''}</p>
            <p className="text-sm uppercase text-gray-700">{job.client.city || ''} {job.client.state || ''}</p>
            <p className="text-sm uppercase font-medium">{job.client.email}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-sm mb-8 border-collapse">
          <thead>
            <tr className="border-t border-b border-dashed border-gray-400">
              <th className="py-2 text-left font-bold w-1/4">PRODUCT</th>
              <th className="py-2 text-left font-bold w-16">QTY</th>
              <th className="py-2 text-left font-bold w-32">UNIT COST</th>
              <th className="py-2 text-left font-bold w-32">AMOUNT</th>
              <th className="py-2 text-left font-bold">DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            {job.items.map((item, index) => (
              <tr key={index} className="border-b border-dashed border-gray-300">
                <td className="py-3 uppercase pr-4">{item.name}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3">{(item.unitPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 uppercase text-gray-700 text-xs">{item.description}</td>
              </tr>
            ))}
            {job.items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500 italic">No items found for this job.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="border-t border-b border-dashed border-gray-400 py-3 mb-12">
          <div className="flex justify-between items-start text-sm">
            <div className="flex-1">
              <p className="font-bold mb-1">SUBTOTAL:</p>
              <p>ZAR {calculatedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex-1 border-l border-dashed border-gray-400 pl-4">
              <p className="font-bold mb-1">DISCOUNT (0%):</p>
              <p>ZAR 0.00</p>
            </div>
            <div className="flex-1 border-l border-dashed border-gray-400 pl-4">
              <p className="font-bold mb-1">DEPOSIT:</p>
              <p>ZAR 0.00</p>
            </div>
            <div className="flex-1 border-l border-dashed border-gray-400 pl-4">
              <p className="font-bold mb-1">TAX (15%):</p>
              <p>ZAR {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex-1 border-l border-dashed border-gray-400 pl-4">
              <p className="font-bold mb-1">TOTAL:</p>
              <p>ZAR {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Footer Banking Details */}
        <div className="text-center text-xs space-y-1 text-gray-800">
          <p>Pullup Print (PTY) Ltd Ta FacePrint ICK 2010/103007/23 | 5 BEACON STREET, MABONENG | NEW DOORFONTEIN,</p>
          <p>WEBSITE: www.faceprint.co.za | E-MAIL: sales@faceprint.co.za | TEL: 081 393 6500 | TEL: 078 599 9702 | CELL: 079 236 0090,</p>
          <p>Full payment requirement for all orders placed unless otherwise stated. 12 Hr speed service available.</p>
          <p className="text-red-600 font-bold italic my-2">Use QUOTE NUMBER as REF on EFT payments.</p>
          <p>BANKING | <span className="font-bold">FNB</span> | FACEPRINT | <span className="font-bold">62219584879</span> | THE ROSE, CODE <span className="font-bold">252942</span> | SWIFT FIRNZAJJ</p>
          <p>BANKING | <span className="font-bold">NEDBANK</span> | FACEPRINT | <span className="font-bold">1249887712</span> | ONLINE BANKING | CODE <span className="font-bold">198765</span></p>
          <p>BANKING | <span className="font-bold">STANDARD</span> | FACEPRINT | <span className="font-bold">000283916</span> | CODE <span className="font-bold">000205</span> | SWIFT SBZAJJ</p>
        </div>

      </div>

      {/* Print Script Injection */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.querySelector('button:first-of-type').addEventListener('click', () => window.print());
          document.querySelector('button:first-of-type span').classList.remove('hidden');
          document.querySelector('button:first-of-type span').textContent = 'Print Quote';
        `
      }} />
    </div>
  );
}
