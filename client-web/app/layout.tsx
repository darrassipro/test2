import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import './globals.css';

const SUPPORTED_LOCALES = ['fr', 'ar', 'en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const getLocaleFromCookies = async (): Promise<SupportedLocale> => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as SupportedLocale)) {
    return localeCookie as SupportedLocale;
  }
  return 'fr';
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocaleFromCookies();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
