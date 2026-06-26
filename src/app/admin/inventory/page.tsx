import { prisma } from '@/lib/prisma';
import { softDeleteProduct, restoreProduct, hardDeleteProduct, toggleHotCategory } from './actions';

export const dynamic = 'force-dynamic';

export default async function InventoryManager({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const currentTab = params.tab || 'active';

  const products = await prisma.product.findMany({
    where: { isDeleted: currentTab === 'recycle' },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inventory Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your products, categories, and recover deleted items.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[rgba(255,255,255,0.05)] pb-4">
        <a 
          href="/admin/inventory?tab=active"
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            currentTab === 'active' 
              ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
              : 'bg-[rgba(255,255,255,0.02)] text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          Active Products
        </a>
        <a 
          href="/admin/inventory?tab=categories"
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            currentTab === 'categories' 
              ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
              : 'bg-[rgba(255,255,255,0.02)] text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          Categories
        </a>
        <a 
          href="/admin/inventory?tab=recycle"
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            currentTab === 'recycle' 
              ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
              : 'bg-[rgba(255,255,255,0.02)] text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Recycle Bin
        </a>
      </div>

      <div className="glass-panel p-1 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-2xl overflow-hidden bg-[rgba(255,255,255,0.02)]">
        <div className="overflow-x-auto">
          {currentTab === 'categories' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.1)]">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category Name</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Hot Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4 font-bold text-white truncate">{cat.name}</td>
                      <td className="p-4 text-sm text-gray-300">{cat._count.products}</td>
                      <td className="p-4">
                        <form action={toggleHotCategory.bind(null, cat.id, !cat.isHotCategory)} className="inline">
                          <button type="submit" className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${cat.isHotCategory ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30' : 'bg-[rgba(255,255,255,0.05)] text-gray-400 border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}>
                            {cat.isHotCategory ? '🔥 HOT' : 'Set as Hot'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.1)]">
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">SKU</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Price</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      {currentTab === 'recycle' ? 'The recycle bin is empty.' : 'No products found.'}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="p-4 font-mono text-xs text-purple-400">{product.sku}</td>
                      <td className="p-4 font-bold text-white max-w-xs truncate" title={product.name}>
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover bg-black" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
                              <span className="text-[10px] text-gray-500">N/A</span>
                            </div>
                          )}
                          <span className="truncate">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        <span className="px-2 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-xs">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-white">
                        R {product.basePrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 text-right">
                        {currentTab === 'active' ? (
                          <form action={softDeleteProduct.bind(null, product.id)} className="inline">
                            <button type="submit" className="text-red-400 hover:text-red-300 font-semibold text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
                              Soft Delete
                            </button>
                          </form>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <form action={restoreProduct.bind(null, product.id)} className="inline">
                              <button type="submit" className="text-green-400 hover:text-green-300 font-semibold text-xs px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20">
                                Restore
                              </button>
                            </form>
                            <form action={hardDeleteProduct.bind(null, product.id)} className="inline">
                              <button type="submit" className="text-gray-400 hover:text-white font-semibold text-xs px-3 py-1.5 bg-gray-500/10 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors border border-[rgba(255,255,255,0.1)] hover:border-red-500/20" title="Permanently Delete">
                                Destroy
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
