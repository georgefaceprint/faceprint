import Link from 'next/link';
import styles from './about.module.css';

export default function AboutUs() {
  return (
    <div className="min-h-screen relative">


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
