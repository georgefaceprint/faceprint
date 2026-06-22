'use client';

import './globals.css';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem' }}>
      <header className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '1rem', background: 'linear-gradient(to right, var(--color-primary), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FacePrint ERP & E-commerce
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Modernizing the backend operations and consumer frontend for FacePrint.
        </p>
      </header>

      <main className="animate-fade-in" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '150ms' }}>
        <a href="/admin" style={{ 
          display: 'block', 
          padding: '2rem', 
          background: 'var(--color-surface)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          width: '300px',
          transition: 'all var(--transition-fast)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Admin ERP &rarr;</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Manage quotes, invoices, jobcards, and clients.</p>
        </a>

        <a href="/shop" style={{ 
          display: 'block', 
          padding: '2rem', 
          background: 'var(--color-surface)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          width: '300px',
          transition: 'all var(--transition-fast)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>E-commerce Shop &rarr;</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Browse products and order custom prints online.</p>
        </a>
      </main>
    </div>
  );
}
