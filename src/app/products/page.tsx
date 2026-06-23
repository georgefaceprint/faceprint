import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import styles from './products.module.css';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  } catch (error) {
    console.error("Database connection blocked by firewall. Using mock data.");
    categories = [
      { id: '1', name: '24Hr PVC Banners', _count: { products: 12 } },
      { id: '2', name: '24Hr Correx Boards', _count: { products: 8 } },
      { id: '3', name: '24Hr Fabric Banners', _count: { products: 5 } },
      { id: '4', name: '24Hr Branded Flags', _count: { products: 15 } },
      { id: '5', name: '24Hr Bannerwalls', _count: { products: 4 } },
      { id: '6', name: '24Hr Branded Gazebos', _count: { products: 9 } },
    ];
  }

  // Generate a placeholder image based on category name
  const getImageUrl = (name: string) => {
    const encoded = encodeURIComponent(name);
    return `https://placehold.co/600x400/0a0a0a/4f46e5?text=${encoded}&font=Montserrat`;
  };

  return (
    <main className={styles.productsContainer}>
      <header className={styles.header}>
        <h1>Hot Categories</h1>
        <p>
          Discover FacePrint's high-quality selection of product categories. 
          Select a category to view our full range.
        </p>
      </header>

      {categories.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>No categories found</h2>
          <p>We are currently updating our inventory. Please check back later!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link key={category.id} href={`/products/${category.id}`} className={styles.categoryCard}>
              <div 
                className={styles.categoryImage} 
                style={{ backgroundImage: `url('${getImageUrl(category.name)}')` }}
              />
              <div className={styles.categoryContent}>
                <h2 className={styles.categoryTitle}>{category.name}</h2>
                <div className={styles.categoryFooter}>
                  <span>{category._count?.products || 0} Products</span>
                  <span className={styles.arrow}>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
