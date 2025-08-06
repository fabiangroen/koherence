import type { Metadata } from "next";
import { Geist, Geist_Mono, Satisfy } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/themetoggle";
import SignIn from "@/components/sign-button";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

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
  weight: "400",
});

export const metadata: Metadata = {
  title: "Koherence",
  description: "Sync books with your Kobo wirelessly",
};

function Header() {
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-background border-b border-border">
      <Link href="/" className="text-2xl">
        Koherence
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <SignIn />
      </div>
    </header>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${SatisfyRegular.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster richColors />
          <div className="min-h-screen flex flex-col">
            <Header />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
