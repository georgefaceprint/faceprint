import type { Metadata } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FacePrint | The Banner Factory",
  description: "24Hr | Same day Printing | Best Prices Guaranteed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <nav>
            <Link href="/" className="navLink">Home</Link>
            <Link href="/about" className="navLink">About Us</Link>
            <Link href="/products" className="navLink">Products</Link>
            <Link href="/faq" className="navLink">FAQs</Link>
            <Link href="/contact" className="navLink">Contact</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
