import { createProduct } from '../actions';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      <div className="flex items-center space-x-4">
        <Link href="/admin/inventory" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inventory
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white">Add New Product</h2>
        <p className="text-gray-400 mt-1">Create a new product in the catalog.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl">
        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Deluxe Pullup Banner"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                required
                placeholder="e.g. BAN-PUL-DLX"
                className="w-full font-mono bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Base Price (ZAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">R</span>
                <input
                  type="number"
                  name="basePrice"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Category
              </label>
              <select
                name="categoryId"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none"
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Product description and specifications..."
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
              ></textarea>
            </div>

          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
