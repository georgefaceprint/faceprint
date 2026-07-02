'use client';

import { useTransition, useState } from 'react';
import { updateJobStatus, recordPayment, sendQuoteEmail, type JobStatus } from './actions';

const STATUS_FLOW: { label: string; value: JobStatus; color: string; next?: JobStatus }[] = [
  { label: 'Pending', value: 'PENDING', color: 'orange', next: 'QUOTED' },
  { label: 'Quoted', value: 'QUOTED', color: 'yellow', next: 'IN_PRODUCTION' },
  { label: 'In Production', value: 'IN_PRODUCTION', color: 'cyan', next: 'COMPLETED' },
  { label: 'Completed', value: 'COMPLETED', color: 'blue', next: 'DELIVERED' },
  { label: 'Delivered', value: 'DELIVERED', color: 'green' },
  { label: 'Cancelled', value: 'CANCELLED', color: 'red' },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  QUOTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  INVOICED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PRODUCTION: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

type Props = {
  jobId: string;
  currentStatus: JobStatus;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  quoteNumber?: string;
  clientName?: string;
};

export default function JobControls({ jobId, currentStatus, totalAmount, amountPaid, balance, quoteNumber = '', clientName = '' }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  const currentStatusDef = STATUS_FLOW.find(s => s.value === currentStatus);
  const nextStatus = currentStatusDef?.next;

  const handleStatusUpdate = (status: JobStatus) => {
    startTransition(() => {
      updateJobStatus(jobId, status);
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('amount', paymentAmount);
    startTransition(() => {
      recordPayment(formData);
      setShowPayment(false);
      setPaymentAmount('');
    });
  };

  return (
    <div className="print:hidden space-y-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Print */}
        <button
          onClick={() => {
            const originalTitle = document.title;
            const safeClientName = clientName.replace(/[^a-zA-Z0-9 -]/g, '').trim();
            const prefix = currentStatus === 'PENDING' || currentStatus === 'QUOTED' ? 'QUOTE' : 'INVOICE';
            document.title = `${prefix}${quoteNumber} ${safeClientName}`;
            window.print();
            setTimeout(() => { document.title = originalTitle; }, 1000);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.4)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Quote
        </button>

        {/* Email */}
        <button
          onClick={() => {
            startTransition(async () => {
              try {
                await sendQuoteEmail(jobId);
                alert('Email sent successfully!');
              } catch (err: any) {
                alert('Failed to send email: ' + err.message);
              }
            });
          }}
          disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email to Client
        </button>

        {/* Current status badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_BADGE[currentStatus] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {currentStatus.replace(/_/g, ' ')}
        </span>

        {/* Advance status */}
        {nextStatus && (
          <button
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={isPending}
            className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] text-white px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
          >
            {isPending ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
            {currentStatus === 'QUOTED' ? 'Convert to Job Card & Start Production' : `Mark as ${nextStatus.replace(/_/g, ' ')}`}
          </button>
        )}

        {/* Cancel */}
        {currentStatus !== 'CANCELLED' && currentStatus !== 'DELIVERED' && (
          <button
            onClick={() => handleStatusUpdate('CANCELLED')}
            disabled={isPending}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel Job
          </button>
        )}
      </div>

      {/* Payment tracker */}
      <div className="glass-panel rounded-xl p-4 border border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-gray-500 mb-0.5">Total</p>
              <p className="text-white font-bold">R {totalAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Paid</p>
              <p className="text-green-400 font-bold">R {amountPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5">Balance</p>
              <p className={`font-bold ${balance > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                R {balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {/* Progress bar */}
            {totalAmount > 0 && (
              <div className="hidden sm:block w-32">
                <div className="h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (amountPaid / totalAmount) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round((amountPaid / totalAmount) * 100)}% paid</p>
              </div>
            )}
          </div>

          {balance > 0 && (
            <button
              onClick={() => setShowPayment(!showPayment)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Record Payment
            </button>
          )}
        </div>

        {/* Payment form */}
        {showPayment && (
          <form onSubmit={handlePaymentSubmit} className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-end gap-3 animate-fade-in">
            <div className="space-y-1 flex-1">
              <label className="text-xs text-gray-400">Payment Amount (R)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={balance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  required
                  placeholder={balance.toFixed(2)}
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Confirm Payment
            </button>
            <button
              type="button"
              onClick={() => setShowPayment(false)}
              className="text-gray-500 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
