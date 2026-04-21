import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Medi Magic HRMS',
  description: 'Medi Magic HRMS admin portal built with Next.js.',
  icons: {
    icon: '/medimagic/medi-magic-logo.png',
    shortcut: '/medimagic/medi-magic-logo.png',
    apple: '/medimagic/medi-magic-logo.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-HK">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
