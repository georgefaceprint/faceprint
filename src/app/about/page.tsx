import Link from 'next/link';
import styles from './about.module.css';

export default function AboutUs() {
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
            <Link href="/about" className="text-white hover:text-white transition-colors font-medium">About Us</Link>
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

      <main className={styles.section}>
        <div className={styles.header}>
          <h1 className={styles.title}>About <span className="text-gradient">Us</span></h1>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.textContent}>
            <p>
              Welcome To FacePrint. Nulla auctor mauris ut dui luctus semper. In hac habitasse platea dictumst. 
              Duis pellentesque ligula a risus suscipit dignissim. Nunc non nisl lacus. Integer pharetra lacinia dapibus. 
              Donec eu dolor dui, vel posuere mauris.
            </p>
            <p>
              Pellentesque semper congue sodales. In consequat, metus eget con sequat ornare, augue dolor blandit purus, 
              vitae lacinia nisi tellus in erat. Nulla ac justo eget massa aliquet sodales. Maecenas mattis male suada sem, 
              in fringilla massa dapibus quis. Suspendisse aliquam leo id neque auctor molestie. Etiam at nulla tellus.
            </p>
            
            <h2>Empowering people & creating economic opportunity.</h2>
            <p>
              Within our markets, millions of people around the world connect, both online and offline, to make, sell and buy unique goods. 
              Our mission is to reimagine commerce in ways that build a more fulfilling and lasting world, and we're committed to using 
              the power of business to strengthen communities and empower people.
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={`glass-panel ${styles.statCard}`}>
              <div className={styles.statValue}>5M+</div>
              <div className={styles.statLabel}>Products Printed</div>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <div className={styles.statValue}>10k</div>
              <div className={styles.statLabel}>Happy Clients</div>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <div className={styles.statValue}>24h</div>
              <div className={styles.statLabel}>Turnaround Time</div>
            </div>
            <div className={`glass-panel ${styles.statCard}`}>
              <div className={styles.statValue}>100%</div>
              <div className={styles.statLabel}>Quality Guaranteed</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
