'use client';

import { useActionState, useEffect, useState } from 'react';
import { loginClient } from './actions';
import Link from 'next/link';

export default function ClientLogin() {
  const [state, formAction] = useActionState(loginClient, undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state?.error) {
      setIsLoading(false);
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B0F19] relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-[2rem] border border-[rgba(255,255,255,0.1)] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500"></div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Client Portal</h1>
            <p className="text-gray-400 text-sm">Enter the email address you used for your quotes to view your dashboard.</p>
          </div>

          <form action={formAction} onSubmit={() => setIsLoading(true)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="sales@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              {isLoading ? 'Sending...' : 'Access Dashboard'}
            </button>
            
            {state?.error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in">
                {state.error}
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
