import React from 'react';
import { prisma } from '@/lib/prisma';
import styles from './products.module.css';

// Force dynamic rendering if necessary, but revalidate is better for storefronts
export const revalidate = 60; // revalidate every 60 seconds

export default async function ProductsPage() {
  // Fetch products from Neon database
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <main className={styles.productsContainer}>
      <header className={styles.header}>
        <h1>Our Premium Products</h1>
        <p>
          Discover FacePrint's high-quality selection of products. 
          Crafted with precision and designed for excellence.
        </p>
      </header>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No products found</h2>
          <p>We are currently updating our inventory. Please check back later!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <article key={product.id} className={styles.card}>
              {product.category && (
                <span className={styles.cardCategory}>
                  {product.category.name}
                </span>
              )}
              <h2 className={styles.cardTitle}>{product.name}</h2>
              <p className={styles.cardDescription}>
                {product.description || 'No description available for this product.'}
              </p>
              
              <div className={styles.cardFooter}>
                <div className={styles.price}>
                  R{product.basePrice.toFixed(2)} <span>base price</span>
                </div>
                <div className={styles.sku}>
                  {product.sku}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
