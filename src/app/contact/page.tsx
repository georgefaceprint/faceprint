"use client";

import Link from 'next/link';
import styles from './contact.module.css';

export default function Contact() {
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
            <Link href="/contact" className="text-white hover:text-white transition-colors font-medium">Contact</Link>
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
          <h1 className={styles.title}>Contact <span className="text-gradient">Us</span></h1>
          <p className="text-gray-400 mt-4 text-lg">Still have questions? Feel free to reach out to our team.</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.infoColumn}>
            <div className={`glass-panel ${styles.infoCard}`}>
              <div className={styles.icon}>📞</div>
              <div>
                <h3 className={styles.infoTitle}>Phone Number</h3>
                <p className={styles.infoText}>+27 11 000 0000</p>
                <p className={styles.infoText}>Mon-Fri, 8:00 AM - 5:00 PM</p>
              </div>
            </div>

            <div className={`glass-panel ${styles.infoCard}`}>
              <div className={styles.icon}>✉️</div>
              <div>
                <h3 className={styles.infoTitle}>Email Address</h3>
                <p className={styles.infoText}>sales@faceprint.co.za</p>
                <p className={styles.infoText}>support@faceprint.co.za</p>
              </div>
            </div>

            <div className={`glass-panel ${styles.infoCard}`}>
              <div className={styles.icon}>📍</div>
              <div>
                <h3 className={styles.infoTitle}>Physical Address</h3>
                <p className={styles.infoText}>
                  Johannesburg<br/>
                  Gauteng<br/>
                  South Africa
                </p>
              </div>
            </div>
          </div>

          <div className={`glass-panel ${styles.formColumn}`}>
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Name</label>
                <input type="text" className={styles.input} placeholder="John Doe" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" className={styles.input} placeholder="john@example.com" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Subject</label>
                <input type="text" className={styles.input} placeholder="How can we help you?" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Message</label>
                <textarea className={styles.textarea} placeholder="Write your message here..." required></textarea>
              </div>
              <button type="submit" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
