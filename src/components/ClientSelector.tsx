'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Client = {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string | null;
  legacyId: string | null;
  city: string | null;
};

export default function ClientSelector() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/clients/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white">Step 1: Select Client</h2>
        <p className="text-gray-400">Search the database to lock in a client before building the quote.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] shadow-2xl space-y-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company, contact name, email, or legacy ID..."
            className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.15)] rounded-xl pl-12 pr-4 py-4 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
            autoFocus
          />
          <svg className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        {query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-400">
            No clients found matching "{query}".
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Search Results</h3>
            <div className="divide-y divide-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden bg-[rgba(0,0,0,0.2)]">
              {results.map((client) => (
                <button
                  key={client.id}
                  onClick={() => router.push(`/admin/jobs/new?clientId=${client.id}`)}
                  className="w-full text-left p-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors group flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-medium text-lg flex items-center gap-2">
                      {client.companyName || client.contactName}
                      {client.legacyId && (
                        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase">
                          {client.legacyId}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mt-1 flex gap-4">
                      {client.companyName && <span>{client.contactName}</span>}
                      {client.email && <span>{client.email}</span>}
                      {client.city && <span>{client.city}</span>}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-purple-400 text-sm font-semibold">
                    Lock Client 
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
