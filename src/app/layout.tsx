import type { Metadata } from "next";
import { Geist, Geist_Mono, Satisfy } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SatisfyRegular = Satisfy({
  variable: "--font-satisfy",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "Koherence",
  description: "Sync books with your Kobo wirelessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${SatisfyRegular.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
