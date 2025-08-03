import type { Metadata } from "next";
import { Geist, Geist_Mono, Satisfy } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { auth } from "@/auth";
import Script from "next/script";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const admin = process.env.ADMIN?.split(",").map(email => email.trim()) || []
  const isAdmin = admin.includes(session?.user?.email ?? "");
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${SatisfyRegular.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        {isAdmin && (
          <Script src="/db-console.js" />
        )}
      </body>
    </html>
  );
}
