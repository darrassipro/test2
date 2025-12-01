import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import './globals.css';

const SUPPORTED_LOCALES = ['fr', 'ar', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const getLocaleFromCookies = (): SupportedLocale => {
  const localeCookie = cookies().get('NEXT_LOCALE')?.value;
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as SupportedLocale)) {
    return localeCookie as SupportedLocale;
  }
  return 'fr';
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = getLocaleFromCookies();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
