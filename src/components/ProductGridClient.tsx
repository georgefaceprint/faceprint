'use client';

import React, { useState } from 'react';
import styles from '@/app/home.module.css';
import Image from 'next/image';

export default function ProductGridClient({ categories }: { categories: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleRequestQuote = (topic: string) => {
    setSelectedProduct(null);
    const event = new CustomEvent('open-chat', { detail: { topic } });
    window.dispatchEvent(event);
  };

  return (
    <>
      <div className={styles.categoriesGrid}>
        {categories.map((cat) => (
          <div key={cat.id} className={`glass-panel ${styles.categoryCard}`}>
            <h3 className={styles.categoryTitle}>{cat.name}</h3>
            <ul className={styles.categoryList}>
              {cat.products.map((product: any) => (
                <li key={product.id}>
                  <button 
                    onClick={() => setSelectedProduct({ ...product, categoryName: cat.name })}
                    className="hover:text-white transition-colors block py-1 w-full text-left bg-transparent border-none cursor-pointer"
                  >
                    {product.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B0F19] border border-[rgba(255,255,255,0.1)] rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Image Section */}
            <div className="md:w-1/2 bg-black flex flex-col relative min-h-[250px]">
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-lg">
                {selectedProduct.categoryName}
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <img 
                  src={selectedProduct.imageUrl || '/logo-icon.png'} 
                  alt={selectedProduct.name}
                  className="max-w-full max-h-[300px] object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-[rgba(255,255,255,0.02)] to-transparent">
              <h2 className="text-3xl font-black text-white mb-4 leading-tight">{selectedProduct.name}</h2>
              <div className="text-gray-400 mb-8 space-y-4">
                <p>
                  Experience premium quality with our <strong className="text-white">{selectedProduct.name}</strong>. 
                  Perfect for your advertising needs and guaranteed to be ready within 24 hours.
                </p>
                {selectedProduct.description ? (
                  <div 
                    className="text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar"
                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }} 
                  />
                ) : (
                  <p>Get in touch with Cherine for custom sizing and exact pricing.</p>
                )}
                <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  R {selectedProduct.basePrice?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <button 
                onClick={() => handleRequestQuote(`I would like a quote for ${selectedProduct.name} (Category: ${selectedProduct.categoryName})`)}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Request Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
