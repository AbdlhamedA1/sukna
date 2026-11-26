import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';

import { AntdProvider } from '../components/AntdProvider';
import './globals.css';

// English LTR is the primary interface language; Cairo is preloaded as a
// CSS variable so future Arabic RTL localization needs no font plumbing.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'SUKNA — سُكنا | Student Housing in Upper Egypt',
    template: '%s | SUKNA',
  },
  description:
    'SUKNA is a verified student and residential housing discovery marketplace for Qena, Sohag, and Minya.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${cairo.variable}`}>
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
