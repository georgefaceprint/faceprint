'use client';

import { useState, useActionState, useEffect } from 'react';
import { authenticate, checkSetupStatus, setupPasscode } from './actions';
import Link from 'next/link';

type UserProfile = {
  id: string;
  name: string;
  phone: string;
  color: string;
  initial: string;
};

export default function LoginForm({ profiles }: { profiles: UserProfile[] }) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSetupMode, setIsSetupMode] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [authError, dispatchAuth] = useActionState(authenticate, undefined);

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleUserSelect = async (user: UserProfile) => {
    setSelectedUser(user);
    setLocalError('');
    setIsLoading(true);
    
    try {
      const isSetup = await checkSetupStatus(user.phone);
      setIsSetupMode(isSetup === false);
    } catch (err) {
      setLocalError('Failed to check user status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setPasscode('');
    setConfirmPasscode('');
    setLocalError('');
    setIsSetupMode(false);
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode !== confirmPasscode) {
      setLocalError('Passcodes do not match.');
      return;
    }
    if (passcode.length < 4) {
      setLocalError('Passcode must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await setupPasscode(selectedUser!.phone, passcode);
      // After setup, automatically log them in
      const formData = new FormData();
      formData.append('phone', selectedUser!.phone);
      formData.append('password', passcode);
      dispatchAuth(formData);
    } catch (err) {
      setLocalError('Failed to setup passcode.');
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    
    setIsLoading(true);
    setLocalError('');
    const formData = new FormData();
    formData.append('phone', selectedUser!.phone);
    formData.append('password', passcode);
    dispatchAuth(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0F19]">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="glass-panel p-8 sm:p-10 rounded-[2rem] border border-[rgba(255,255,255,0.1)] shadow-2xl relative overflow-hidden">
          {/* Subtle gradient overlay on top edge */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500"></div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {selectedUser ? `Welcome, ${selectedUser.name}` : 'FacePrint ERP'}
            </h1>
            <p className="text-gray-400 text-sm">
              {selectedUser 
                ? (isSetupMode ? 'Create your new passcode to secure your account.' : 'Enter your passcode to log in.') 
                : 'Select your profile to continue.'}
            </p>
          </div>

          {!selectedUser ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {profiles.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p>No staff profiles found in the database.</p>
                </div>
              ) : (
                profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleUserSelect(profile)}
                    className="w-full group flex items-center p-4 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${profile.color} shadow-lg group-hover:scale-105 transition-transform shrink-0`}>
                      {profile.initial}
                    </div>
                    <div className="ml-4 text-left min-w-0">
                      <div className="text-white font-semibold text-lg truncate">{profile.name}</div>
                      <div className="text-gray-500 text-sm">Tap to login</div>
                    </div>
                    <div className="ml-auto text-gray-500 group-hover:text-white transition-colors shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={isSetupMode ? handleSetupSubmit : handleLoginSubmit} className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300" htmlFor="passcode">
                    {isSetupMode ? 'New Passcode' : 'Passcode'}
                  </label>
                  <input
                    id="passcode"
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center text-2xl tracking-[0.5em]"
                  />
                </div>

                {isSetupMode && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-sm font-medium text-gray-300" htmlFor="confirmPasscode">
                      Confirm Passcode
                    </label>
                    <input
                      id="confirmPasscode"
                      type="password"
                      inputMode="numeric"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      required
                      className="w-full bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center text-2xl tracking-[0.5em]"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? 'Processing...' : (isSetupMode ? 'Save & Login' : 'Login Securely')}
              </button>
              
              <div className="flex flex-col items-center space-y-4 pt-2">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  &larr; Switch Profile
                </button>
                
                <div className="flex h-8 items-end w-full" aria-live="polite" aria-atomic="true">
                  {localError && (
                    <p className="text-sm text-red-400 w-full text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-fade-in">
                      {localError}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}

          {!selectedUser && (
            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                &larr; Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
