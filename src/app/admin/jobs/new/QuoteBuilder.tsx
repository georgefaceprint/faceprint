'use client';

import { useState, useTransition } from 'react';
import { createQuote, updateQuote } from './actions';

type LineItem = {
  id: number;
  productName: string;
  description: string;
  quantity: number;
  unitCost: number;
};

type LockedClient = {
  id: string;
  companyName: string | null;
  contactName: string;
  legacyId: string | null;
  vatNumber: string | null;
};

type Product = {
  id: string;
  name: string;
  basePrice: number;
  description: string | null;
};

export default function QuoteBuilder({ 
  lockedClient, 
  products,
  initialProductId,
  initialQty,
  requestId,
  existingJob
}: { 
  lockedClient: LockedClient, 
  products: Product[],
  initialProductId?: string,
  initialQty?: string,
  requestId?: string,
  existingJob?: any

}) {
  const [isPending, startTransition] = useTransition();
  const [jobDescription, setJobDescription] = useState(existingJob?.description || '');
  
  // Parse discount from existingJob notes
  const [discount, setDiscount] = useState(() => {
    if (existingJob?.notes) {
      const match = existingJob.notes.match(/Discount:\s*([\d.]+)%/);
      if (match) return parseFloat(match[1]);
    }
    return 0;
  });

  const [items, setItems] = useState<LineItem[]>(() => {
    if (existingJob?.items?.length) {
      return existingJob.items.map((item: any, idx: number) => {
        // Split description by ' - ' assuming the first part is productName
        const parts = item.description.split(' - ');
        const productName = parts[0] || '';
        const desc = parts.slice(1).join(' - ') || '';
        return {
          id: String(idx + 1),
          productId: '', // We don't store productId directly on jobItem right now
          productName,
          description: desc,
          quantity: item.quantity,
          unitCost: item.unitPrice
        };
      });
    }

    if (initialProductId) {
      const prod = products.find(p => p.id === initialProductId);
      if (prod) {
        return [{
          id: '1',
          productId: prod.id,
          description: prod.name,
          quantity: parseInt(initialQty || '1', 10) || 1,
          unitPrice: prod.basePrice,
        }];
      }
    }
    return [
      { id: '1', productId: '', description: '', quantity: 1, unitPrice: 0 },
      { id: '2', productId: '', description: '', quantity: 1, unitPrice: 0 },
      { id: '3', productId: '', description: '', quantity: 1, unitPrice: 0 },
      { id: '4', productId: '', description: '', quantity: 1, unitPrice: 0 },
      { id: '5', productId: '', description: '', quantity: 1, unitPrice: 0 }
    ];
  });
  const [nextId, setNextId] = useState(6);

  const addRow = () => {
    setItems(prev => [
      ...prev,
      { id: String(nextId), productId: '', description: '', quantity: 1, unitPrice: 0 },
    ]);
    setNextId(n => n + 1);
  };

  const removeRow = (id: string) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const discountAmount = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * 0.15;
  const total = afterDiscount + tax;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    if (requestId) formData.append('requestId', requestId);
    formData.append('clientId', lockedClient.id);
    formData.append('description', jobDescription);
    formData.append('discount', String(discount));
    formData.append('itemCount', String(items.length));
    items.forEach((item, i) => {
      formData.append(`item_${i}_productName`, item.productName);
      formData.append(`item_${i}_description`, item.description);
      formData.append(`item_${i}_quantity`, String(item.quantity));
      formData.append(`item_${i}_unitCost`, String(item.unitCost));
    });
    startTransition(() => {
      if (existingJob) {
        updateQuote(existingJob.id, formData);
      } else {
        createQuote(formData);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex justify-between">
            Prefilled Client Details
            <a href="/admin/jobs/new" className="text-xs text-cyan-400 hover:text-cyan-300 normal-case flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              Select Different Client
            </a>
          </label>
          <div className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl px-4 py-3 text-white flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <div className="flex items-center gap-3">
              <div>
                <div className="font-black text-lg tracking-wider uppercase">{lockedClient.companyName || lockedClient.contactName}</div>
                {(lockedClient.vatNumber || lockedClient.legacyId) && (
                  <div className="text-xs text-white/90 font-medium flex gap-3 mt-0.5">
                    {lockedClient.vatNumber && <span>VAT: {lockedClient.vatNumber}</span>}
                    {lockedClient.legacyId && <span>ID: {lockedClient.legacyId}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Internal Job Description *
          </label>
          <input
            type="text"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            required
            placeholder="e.g. 5x Pullup Banners for Expo"
            className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Line Items</h3>
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Row
          </button>
        </div>

        {/* Header Row */}
        <div className="hidden md:grid grid-cols-[2fr_3fr_80px_120px_40px] gap-3 px-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Cost (R)</span>
          <span />
        </div>

        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-[2fr_3fr_80px_120px_40px] gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-3 group"
          >
            <input
              list="products-list"
              value={item.productName}
              onChange={e => {
                const val = e.target.value;
                updateItem(item.id, 'productName', val);
                const matched = products.find(p => p.name === val);
                if (matched) {
                  updateItem(item.id, 'unitCost', matched.basePrice);
                  if (matched.description) {
                    updateItem(item.id, 'description', matched.description);
                  }
                }
              }}
              required
              placeholder="Search products..."
              className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <input
              type="text"
              value={item.description}
              onChange={e => updateItem(item.id, 'description', e.target.value)}
              placeholder="Deluxe pullup banner 850mm..."
              className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
              required
              className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors text-center"
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitCost || ''}
                onChange={e => updateItem(item.id, 'unitCost', Number(e.target.value))}
                required
                placeholder="0.00"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(item.id)}
              disabled={items.length === 1}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title="Remove row"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* Per-row total label on mobile */}
            <div className="md:hidden col-span-full text-right text-sm text-gray-400">
              Line total: <span className="text-white font-semibold">R {(item.quantity * item.unitCost).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        ))}

        <datalist id="products-list">
          {products.map(p => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
      </div>

      {/* Totals Panel */}
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white font-medium">R {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Discount</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-16 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-purple-500 transition-colors"
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>
          <span className="text-orange-400 font-medium">- R {discountAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between text-sm border-t border-[rgba(255,255,255,0.06)] pt-3">
          <span className="text-gray-400">VAT (15%)</span>
          <span className="text-white font-medium">R {tax.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex justify-between border-t border-[rgba(255,255,255,0.1)] pt-3">
          <span className="text-lg font-bold text-white">Total</span>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating Quote...
          </span>
        ) : existingJob ? (
          'Update Quote Document'
        ) : (
          'Generate Quote Document'
        )}
      </button>
      <p className="text-xs text-center text-gray-500">Quote number will be auto-generated from the date + your initials.</p>
    </form>
  );
}
