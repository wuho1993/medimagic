import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
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
  const buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION ?? 'local';

  return (
    <html lang="zh-HK">
      <body>
        {buildVersion !== 'local' ? (
          <Script id="medimagic-build-version-guard" strategy="beforeInteractive">
            {`(function(){try{var expected=${JSON.stringify(buildVersion)};fetch('/medimagic/build-version.json?ts='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(payload){if(payload&&payload.version&&payload.version!==expected){var url=new URL(window.location.href);url.searchParams.set('__v',payload.version);window.location.replace(url.toString());}}).catch(function(){});}catch(e){}})();`}
          </Script>
        ) : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
