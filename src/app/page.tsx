import Link from 'next/link';
import styles from './home.module.css';

export default function Home() {
  const categories = [
    {
      title: "24Hr PVC Banners",
      items: ["Hanging Banners", "Trailer Banners", "Birthday Banners", "Billboards", "Custom Size Banners"]
    },
    {
      title: "24Hr Correx Boards",
      items: ["A1 Selfie Boards", "A0 Selfie Boards", "A1 Correx Boards", "A2 Correx Boards", "A0 Correx Boards", "Custom Size Correx"]
    },
    {
      title: "24Hr Fabric Banners",
      items: ["Tableclothes", "Stretch Fabric Banners", "Framed Fabric Banners"]
    },
    {
      title: "24Hr Branded Flags",
      items: ["Telescopic Flags", "Sharkfin Flags", "Arc Flags", "Hanging Flags", "Cluster Flags"]
    },
    {
      title: "24Hr Bannerwalls",
      items: ["2.25x1.5m B-Wall", "2.25x2.25m B-Wall", "2.25x3m B-Wall", "2.25x3.75m B-Wall", "2.25x4.5m B-Wall", "2.25x6m B-Wall"]
    },
    {
      title: "24Hr Branded Gazebos",
      items: ["2mx2m Aluminium Gazebo", "3mx3m Steel Gazebo", "3mx3m Aluminium", "3mx4.5m Aluminium", "3x6m Aluminium"]
    }
  ];

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
        <div className={styles.categoriesGrid}>
          {categories.map((cat, i) => (
            <div key={i} className={`glass-panel ${styles.categoryCard}`}>
              <h3 className={styles.categoryTitle}>{cat.title}</h3>
              <ul className={styles.categoryList}>
                {cat.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

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
