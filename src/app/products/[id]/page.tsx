import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { basePrice: 'asc' }
      }
    }
  });

  if (!category) {
    notFound();
  }

  // Generate a placeholder image based on product name if imageUrl is missing
  const getImageUrl = (name: string) => {
    const encoded = encodeURIComponent(name);
    return `https://placehold.co/600x400/0a0a0a/4f46e5?text=${encoded}&font=Montserrat`;
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <Link href="/products" className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm mb-8">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Categories
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-xl text-gray-400 max-w-3xl">{category.description}</p>
        )}
      </div>

      {category.products.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center border border-[rgba(255,255,255,0.1)]">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">No products found</h2>
          <p className="text-gray-400">This category currently has no items in stock.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {category.products.map((product) => (
            <Link key={product.id} href={`/products/item/${product.id}`} className="group glass-panel rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)] hover:border-purple-500/30 transition-all duration-300 flex flex-col">
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-[rgba(0,0,0,0.5)]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${product.imageUrl || getImageUrl(product.name)}')` }}
                />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs font-mono text-purple-400 mb-2">{product.sku}</div>
                <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">{product.name}</h2>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.05)]">
                  <span className="text-sm text-gray-400">From</span>
                  <span className="text-xl font-black text-white">R {product.basePrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
