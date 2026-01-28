import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Google Fonts
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnionParts - Used Auto Parts Market",
  description: "Simple, reliable used car parts marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div className="h-16 bg-white shadow-sm" />}>
          <Navbar />
        </Suspense>
        {children}
        <Footer />
      </body>
    </html>
  );
}
