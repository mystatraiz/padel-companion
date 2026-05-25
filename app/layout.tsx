import type { Metadata, Viewport } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AppShell } from '@/components/AppShell';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PadelPulse',
  description: 'Suivi de matchs, progression et matériel padel',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PadelPulse',
  },
  icons: {
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0e10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ServiceWorkerRegister />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
