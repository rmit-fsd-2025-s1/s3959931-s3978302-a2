import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/shared/styles/globals.css"; // Adjusted path as per proposed structure
import Header from "@/shared/components/layout/header"; // Lowercase
import Footer from "@/shared/components/layout/footer/footer"; // Corrected path

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teaching App",
  description: "A teaching application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {" "}
        {/* Added flex classes for sticky footer */}
        <Header />
        <main className="flex-grow">
          {" "}
          {/* Added flex-grow to push footer down */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
