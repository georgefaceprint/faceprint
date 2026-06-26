import Link from 'next/link';
import styles from './home.module.css';
import ProductGridModal from '@/components/ProductGridModal';

export default function Home() {
  return (
    <div className="min-h-screen relative">


      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            The Banner Factory <br/>
            <span className="text-gradient">Home of 24Hr Banners</span>
          </h1>
          <p className={styles.subtitle}>
            Same day printing. Best prices guaranteed. Get your high-quality prints exactly when you need them.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="#categories" className={styles.btnPrimary}>
              View Products
            </Link>
            <Link href="/contact" className={styles.btnSecondary}>
              Get a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Categories */}
      <section id="categories" className={styles.section}>
        <h2 className={styles.sectionTitle}>Hot <span className="text-gradient">Categories</span></h2>
        <ProductGridModal />

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          <div className={`glass-panel ${styles.featureItem}`}>
            <h3 className={styles.featureTitle}>Free Shipping</h3>
            <p className={styles.featureDesc}>On all orders</p>
          </div>
          <div className={`glass-panel ${styles.featureItem}`}>
            <h3 className={styles.featureTitle}>Money Back</h3>
            <p className={styles.featureDesc}>100% guarantee</p>
          </div>
          <div className={`glass-panel ${styles.featureItem}`}>
            <h3 className={styles.featureTitle}>Safe Shopping</h3>
            <p className={styles.featureDesc}>Secure checkout</p>
          </div>
          <div className={`glass-panel ${styles.featureItem}`}>
            <h3 className={styles.featureTitle}>24H Support</h3>
            <p className={styles.featureDesc}>Always online</p>
          </div>
        </div>
      </section>

    </div>
  );
}
