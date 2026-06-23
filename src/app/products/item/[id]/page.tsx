import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProductItemPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true
    }
  });

  if (!product) {
    notFound();
  }

  const getImageUrl = (name: string) => {
    const encoded = encodeURIComponent(name);
    return `https://placehold.co/800x600/0a0a0a/4f46e5?text=${encoded}&font=Montserrat`;
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/products/${product.category.id}`} className="hover:text-white transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-purple-400 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.1)] p-2">
          <div className="aspect-[4/3] w-full relative rounded-2xl overflow-hidden bg-black">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${product.imageUrl || getImageUrl(product.name)}')` }}
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="space-y-8">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-mono text-xs font-bold tracking-wider mb-4 border border-purple-500/20">
              SKU: {product.sku}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {product.name}
            </h1>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              R {product.basePrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent" />

          {product.description && (
            <div className="prose prose-invert max-w-none text-gray-300">
              <h3 className="text-lg font-bold text-white mb-2">Description</h3>
              <p className="leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] space-y-4">
            <h3 className="text-lg font-bold text-white">Need a Quote?</h3>
            <p className="text-sm text-gray-400">
              For exact pricing on specific quantities, custom sizes, or bulk orders, please request a formal quote.
            </p>
            <Link 
              href="/contact" 
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
