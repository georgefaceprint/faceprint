import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <header className="glass-panel fixed top-0 w-full z-50 rounded-none border-t-0 border-x-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo-full.png" 
            alt="FacePrint Logo" 
            width={180} 
            height={50} 
            className="object-contain"
            priority
          />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" prefetch={false} className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link>
          <Link href="/about" prefetch={false} className="text-gray-300 hover:text-white transition-colors font-medium">About Us</Link>
          <Link href="/products" prefetch={false} className="text-gray-300 hover:text-white transition-colors font-medium">Products</Link>
          <Link href="/faq" prefetch={false} className="text-gray-300 hover:text-white transition-colors font-medium">FAQs</Link>
          <Link href="/contact" prefetch={false} className="text-gray-300 hover:text-white transition-colors font-medium">Contact</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link 
            href="/login" 
            prefetch={false}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </header>
  );
}
