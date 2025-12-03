import type { Metadata } from 'next';
import { Geist, Mulish, IBM_Plex_Sans_Arabic, Tajawal, Poppins } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import ReduxProvider from '../../lib/ReduxProvider';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';

// Police Poppins pour l'anglais/français
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const locales = ['fr', 'ar', 'en'];

export const metadata: Metadata = {
  title: 'ajiw',
  description: 'ajiw',
  icons: '/icon.ico',
  openGraph: {
    title: 'ajiw',
    description: 'ajiw',
    url: 'https://ajiw.ma',
    siteName: 'ajiw',
    images: [
      {
        url: '/ajiw_og.jpg',
        width: 1200,
        height: 630,
        alt: 'ajiw',
      },
    ],
    locale: 'ar_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ajiw',
    description: 'ajiw',
    images: ['/ajiw_og.jpg'],
    creator: '@ajiw',
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <ReduxProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>
          <div
            className={`${poppins.variable} font-poppins min-h-screen bg-background text-foreground antialiased`}
          >
            {children}
          </div>
          <Toaster position="top-center" richColors theme="light" />
        </AuthProvider>
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}
