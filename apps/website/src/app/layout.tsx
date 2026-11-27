import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';

import { AntdProvider } from '../components/AntdProvider';
import { SiteHeader } from '../components/layout/SiteHeader';
import './globals.css';

// English LTR is the primary interface language; Cairo is preloaded as a
// CSS variable so future Arabic RTL localization needs no font plumbing.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://suknawebsite-production.up.railway.app';

const siteTitle = 'SUKNA — سُكنا | Student Housing in Upper Egypt';
const siteDescription =
  'SUKNA is a verified student and residential housing discovery marketplace for Qena, Sohag, and Minya.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | SUKNA',
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    siteName: 'SUKNA',
    locale: 'en_EG',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [{ url: '/logo-h.png', alt: 'SUKNA' }],
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
    images: ['/logo-h.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${cairo.variable}`}>
      <body>
        <AntdProvider>
          <SiteHeader />
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
