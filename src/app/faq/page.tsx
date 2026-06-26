"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './faq.module.css';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Shipping",
      questions: [
        { q: "What Shipping Methods Are Available?", a: "We use trusted nationwide couriers for all deliveries across South Africa. For local orders, you can also opt to collect your prints directly from our facility." },
        { q: "Do You Ship Internationally?", a: "Currently, we specialize in delivering high-quality prints within South Africa. We cover all major cities and regional areas." },
        { q: "How Long Will It Take To Get My Package?", a: "Standard printing takes 2-4 business days. Once dispatched, standard courier delivery takes an additional 1-3 business days depending on your location. We also offer 24-hour rush printing on selected products such as PVC Banners!" }
      ]
    },
    {
      category: "Payment",
      questions: [
        { q: "What Payment Methods Are Accepted?", a: "We accept all major Credit and Debit cards via our secure payment gateway, as well as EFT (Electronic Funds Transfer). Your order goes into production as soon as payment clears." },
        { q: "Is Buying On-Line Safe?", a: "Absolutely. Our platform uses state-of-the-art SSL encryption and we partner with certified, trusted payment providers to ensure your details are 100% secure." }
      ]
    },
    {
      category: "Orders & Returns",
      questions: [
        { q: "How do I place an Order?", a: "Simply browse our product catalog, select your printing options, and click 'Get a Quote' or 'Buy Now'. You can upload your custom artwork directly or email it to our design team." },
        { q: "How Can I Cancel Or Change My Order?", a: "Because our printing processes are rapid, changes or cancellations must be made within 1 hour of placing the order. Please contact our support team immediately if you need to make changes before production starts." },
        { q: "Do I need an account to place an order?", a: "You can check out as a guest, but creating an account allows you to easily track your orders, save your artwork files, and re-order with a single click." },
        { q: "How Do I Track My Order?", a: "Once your order is dispatched, you will receive an email with a tracking number and a link to trace your package in real-time." },
        { q: "What is your Return Policy?", a: "If your print is defective or does not match your approved proof, please contact us within 7 days of receipt. We stand by our work and will gladly reprint the item or offer a refund according to our quality guarantee." }
      ]
    }
  ];

  let globalIndex = 0;

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
            <Link href="/faq" className="text-white hover:text-white transition-colors font-medium">FAQs</Link>
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
          <h1 className={styles.title}>Frequently Asked <span className="text-gradient">Questions</span></h1>
        </div>

        <div className={styles.accordion}>
          {faqs.map((section, sIdx) => (
            <div key={sIdx} className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">{section.category}</h2>
              <div className="flex flex-col gap-4">
                {section.questions.map((faq) => {
                  const currentIndex = globalIndex++;
                  const isOpen = openIndex === currentIndex;
                  return (
                    <div 
                      key={currentIndex} 
                      className={`glass-panel ${styles.faqItem}`}
                      data-open={isOpen}
                    >
                      <button 
                        className={styles.question}
                        onClick={() => setOpenIndex(isOpen ? null : currentIndex)}
                      >
                        {faq.q}
                        <span className={styles.icon}>+</span>
                      </button>
                      <div className={styles.answer}>
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
