import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import Providers from '@/app/providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: '7000 Solutions — AI-Powered Urban Solutions Platform',
  description:
    'Browse 7,000+ AI-generated solutions to world issues. Search semantically, follow step-by-step build guides, track progress, and bring solutions to your city.',
  manifest: '/manifest.json',
  keywords: ['civic tech', 'urban solutions', 'open source', 'Detroit', 'St. Louis', 'AI'],
  openGraph: {
    title: '7000 Solutions — AI-Powered Urban Solutions Platform',
    description:
      '7,000+ open, actionable solutions to world issues — each with a step-by-step build guide. Built for citizens, cities, and developers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '7000 Solutions',
    description: '7,000+ open solutions to world issues, ready to build.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '7000 Solutions',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
