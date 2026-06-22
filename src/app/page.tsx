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
      {/* Navigation Bar */}
      <header className="glass-panel fixed top-0 w-full z-50 rounded-none border-t-0 border-x-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xl shadow-lg text-white">
              F
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">FacePrint</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors font-medium">About Us</Link>
            <Link href="/faq" className="text-gray-300 hover:text-white transition-colors font-medium">FAQs</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors font-medium">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

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
