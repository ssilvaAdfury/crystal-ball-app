import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

import { Roboto } from "next/font/google";
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'],

});

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={roboto.className}>
    <body className="bg-black">{children}</body> 
    </html>
  );
}
