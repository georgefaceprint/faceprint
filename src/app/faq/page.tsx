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
        { q: "What Shipping Methods Are Available?", a: "Ex Portland Pitchfork irure mustache. Eutra fap before they sold out literally. Aliquip ugh bicycle rights actually mlkshk, seitan squid craft beer tempor." },
        { q: "Do You Ship Internationally?", a: "Hoodie tote bag mixtape tofu. Typewriter jean shorts wolf quinoa, messenger bag organic freegan cray." },
        { q: "How Long Will It Take To Get My Package?", a: "Swag slow-carb quinoa VHS typewriter pork belly brunch, paleo single-origin coffee Wes Anderson. Flexitarian Pitchfork forage, literally paleo fap pour-over. Wes Anderson Pinterest YOLO fanny pack meggings, deep v XOXO chambray sustainable slow-carb raw denim church-key fap chillwave Etsy. +1 typewriter kitsch, American Apparel tofu Banksy Vice." }
      ]
    },
    {
      category: "Payment",
      questions: [
        { q: "What Payment Methods Are Accepted?", a: "Fashion axe DIY jean shorts, swag kale chips meh polaroid kogi butcher Wes Anderson chambray next level semiotics gentrify yr. Voluptate photo booth fugiat Vice. Austin sed Williamsburg, ea labore raw denim voluptate cred proident mixtape excepteur mustache. Twee chia photo booth readymade food truck, hoodie roof party swag keytar PBR DIY." },
        { q: "Is Buying On-Line Safe?", a: "Art party authentic freegan semiotics jean shorts chia cred. Neutra Austin roof party Brooklyn, synth Thundercats swag 8-bit photo booth. Plaid letterpress leggings craft beer meh ethical Pinterest." }
      ]
    },
    {
      category: "Orders & Returns",
      questions: [
        { q: "How do I place an Order?", a: "Keytar cray slow-carb, Godard banh mi salvia pour-over. Slow-carb Odd Future seitan normcore. Master cleanse American Apparel gentrify flexitarian beard slow-carb next level." },
        { q: "How Can I Cancel Or Change My Order?", a: "Plaid letterpress leggings craft beer meh ethical Pinterest. Art party authentic freegan semiotics jean shorts chia cred. Neutra Austin roof party Brooklyn, synth Thundercats swag 8-bit photo booth." },
        { q: "Do I need an account to place an order?", a: "Thundercats swag 8-bit photo booth. Plaid letterpress leggings craft beer meh ethical Pinterest. Twee chia photo booth readymade food truck, hoodie roof party swag keytar PBR DIY. Cray ugh 3 wolf moon fap, fashion axe irony butcher cornhole typewriter chambray VHS banjo street art." },
        { q: "How Do I Track My Order?", a: "Keytar cray slow-carb, Godard banh mi salvia pour-over. Slow-carb @Odd Future seitan normcore. Master cleanse American Apparel gentrify flexitarian beard slow-carb next level." },
        { q: "How Can I Return a Product?", a: "Kale chips Truffaut Williamsburg, hashtag fixie Pinterest raw denim c hambray drinking vinegar Carles street art Bushwick gastropub. Wolf Tumblr paleo church-key. Plaid food truck Echo Park YOLO bitters hella, direct trade Thundercats leggings quinoa before they sold out. You probably haven't heard of them wayfarers authentic umami drinking vinegar Pinterest Cosby sweater, fingerstache fap High Life." }
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
