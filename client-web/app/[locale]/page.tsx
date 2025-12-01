import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Activer le rendu statique
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
    </main>
  );
}
