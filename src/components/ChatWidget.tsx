'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // @ts-ignore
  const { messages, append, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      setIsOpen(true);
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.topic) {
        import('react').then(({ startTransition }) => {
          startTransition(() => {
            setIsLoading(true);
            append({ role: 'user', content: customEvent.detail.topic })
              .catch(console.error)
              .finally(() => setIsLoading(false));
          });
        });
      }
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, [append]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    const form = e.currentTarget;
    const inputEl = form.elements.namedItem('chatInput') as HTMLInputElement;
    const currentInput = inputEl.value;
    
    if (!currentInput.trim()) return;
    
    inputEl.value = '';
    
    import('react').then(({ startTransition }) => {
      startTransition(() => {
        setIsLoading(true);
        append({ role: 'user', content: currentInput })
          .catch(console.error)
          .finally(() => setIsLoading(false));
      });
    });
  };

  const resetChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 transition-all z-50 ${isOpen ? 'hidden' : 'block'}`}
        aria-label="Open support chat"
      >
        <div className="relative">
          <img 
            src="/images/cherine_avatar.png" 
            alt="Chat with Cherine" 
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
          />
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0B0F19] shadow-sm"></div>
        </div>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-[#0B0F19] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.15)] z-50 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/images/cherine_avatar.png" alt="Cherine" className="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0B0F19]"></div>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Cherine</h3>
              <p className="text-xs text-purple-400">FacePrint Support</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button 
                onClick={resetChat}
                title="Restart Conversation"
                className="text-purple-400 hover:text-white transition-colors p-2 text-xs font-semibold rounded-lg bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)]"
              >
                Reset
              </button>
            )}
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <img src="/images/cherine_avatar.png" alt="Cherine" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-[rgba(139,92,246,0.3)]" />
              <p className="text-sm mb-6">Hi! I'm Cherine. How can I help you with your printing needs today?</p>
              
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {[
                  "Get a quote",
                  "Browse categories",
                  "24H PVC Banners",
                  "24Hr Gazebos",
                  "24Hr Wallbanners",
                  "24Hr Flags"
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      import('react').then(({ startTransition }) => {
                        startTransition(() => {
                          setIsLoading(true);
                          append({ role: 'user', content: topic })
                            .catch(console.error)
                            .finally(() => setIsLoading(false));
                        });
                      });
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-purple-300 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-full hover:bg-[rgba(139,92,246,0.2)] transition-colors whitespace-nowrap"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-[rgba(255,255,255,0.05)] text-gray-200 border border-[rgba(255,255,255,0.1)] rounded-tl-none prose prose-invert prose-sm max-w-none'
                }`}
              >
                {m.parts?.map((p, i) => {
                  if (p.type === 'text') {
                    if (m.role === 'user') return <span key={i}>{p.text}</span>;
                    const htmlContent = p.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-purple-400 hover:text-purple-300 underline" target="_blank">$1</a>')
                      .replace(/\n/g, '<br/>');
                    return <span key={i} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
                  }
                  
                  if (p.type === 'tool-invocation') {
                    const invocation = p as any;
                    // If the tool is still running, show a spinner
                    if (!('result' in invocation)) {
                      return (
                        <div key={i} className="flex items-center gap-2 text-purple-300 text-xs italic mt-2">
                          <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          {invocation.toolName === 'searchProducts' ? 'Searching inventory...' : 'Generating quote...'}
                        </div>
                      );
                    }
                    
                    // Render completed tool results
                    if (invocation.toolName === 'searchProducts' && Array.isArray(invocation.result)) {
                      if (invocation.result.length === 0) return <div key={i} className="mt-2 text-xs text-gray-400 italic">No products found.</div>;
                      return (
                        <div key={i} className="mt-3 space-y-2">
                          <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider mb-1">Search Results:</p>
                          {invocation.result.map((prod: any) => (
                            <div key={prod.id} className="bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)] rounded-lg p-2 text-sm flex justify-between items-center">
                              <div>
                                <a href={`/products/item/${prod.id}`} target="_blank" className="text-white hover:text-purple-300 font-medium transition-colors">{prod.name}</a>
                                <div className="text-xs text-gray-400 line-clamp-1">{prod.description}</div>
                              </div>
                              <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 whitespace-nowrap ml-2">
                                R {prod.basePrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    if (invocation.toolName === 'generateInstantQuote' && invocation.result?.success) {
                      return (
                        <div key={i} className="mt-4 p-4 bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(6,182,212,0.1)] border border-purple-500/30 rounded-xl flex flex-col items-center text-center">
                          <svg className="w-8 h-8 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="text-white font-bold mb-1">Quote Generated!</h4>
                          <p className="text-xs text-gray-300 mb-3">{invocation.result.message}</p>
                          <a href={invocation.result.quoteUrl} target="_blank" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg transition-colors w-full">
                            Open Quote Document
                          </a>
                        </div>
                      );
                    }
                  }
                  
                  return null;
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl rounded-tl-none p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              name="chatInput"
              required
              placeholder="Ask a question..."
              className="flex-1 bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="text-[10px] text-center text-gray-500 mt-2">
            Powered by FacePrint AI
          </div>
        </div>
      </div>
    </>
  );
}
