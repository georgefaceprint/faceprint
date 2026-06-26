import type { Metadata } from "next";
import Link from "next/link";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
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
        <PWAInstallPrompt />
        <Navbar />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
