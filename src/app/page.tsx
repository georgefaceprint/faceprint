import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent blur-3xl pointer-events-none -z-10"></div>
      
      {/* Navigation Bar */}
      <header className="border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-xl shadow-lg">
              F
            </div>
            <span className="text-2xl font-bold tracking-tight">FacePrint</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link href="/products" className="text-gray-300 hover:text-white transition-colors">Products & Banners</Link>
            <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">Gallery</Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Staff Login
            </Link>
            <Link 
              href="/quote"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              Request Quote
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
            The Banner Factory <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-cyan-400 animate-gradient-x">
              Home of 24Hr Banners
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Same day printing. Best prices guaranteed. Get your high-quality prints exactly when you need them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/products"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all hover:-translate-y-1"
            >
              View Our Products
            </Link>
            <Link 
              href="/quote"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            >
              Get an Instant Quote
            </Link>
          </div>
        </div>

        {/* Temporary Placeholder for Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-white/10 pt-16">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center text-2xl">⚡️</div>
            <h3 className="text-xl font-bold">24 Hour Turnaround</h3>
            <p className="text-gray-400">We specialize in rapid printing without compromising on quality.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center text-2xl">💎</div>
            <h3 className="text-xl font-bold">Premium Quality</h3>
            <p className="text-gray-400">Industry leading materials and state of the art printing technology.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-fuchsia-500/10 flex items-center justify-center text-2xl">🤝</div>
            <h3 className="text-xl font-bold">Best Prices</h3>
            <p className="text-gray-400">Unbeatable value guaranteed across our entire product range.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
