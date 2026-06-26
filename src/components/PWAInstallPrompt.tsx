'use client';

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Check if it's already installed (standalone mode)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    if (isStandaloneMode) return;

    // 2. Check dismissal cookie
    const dismissed = document.cookie.includes('pwa_prompt_dismissed=true');
    if (dismissed) return;

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // iOS doesn't fire beforeinstallprompt, so just show the custom iOS prompt
      setShowPrompt(true);
    } else {
      // 4. Android/Desktop: Listen for the native prompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault(); // Prevent native mini-infobar
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Set cookie for 7 days
    const date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `pwa_prompt_dismissed=true;expires=${date.toUTCString()};path=/`;
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    // We don't need the prompt event again regardless of outcome
    setDeferredPrompt(null);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 animate-slide-down pointer-events-none">
      <div className="max-w-2xl mx-auto glass-panel border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-center gap-4 pointer-events-auto bg-[#0B0F19]/95 backdrop-blur-xl">
        
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-white font-bold text-sm">Install FacePrint ERP</h4>
          {isIOS ? (
            <p className="text-xs text-gray-400 mt-1">
              Tap the <strong className="text-purple-400">Share</strong> icon below, then select <strong className="text-white">Add to Home Screen</strong>.
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              Install our app for a faster, full-screen experience.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={dismissPrompt}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            Not Now
          </button>
          {!isIOS && deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
            >
              Install App
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
