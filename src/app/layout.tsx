import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "AdForge AI — Créez des visuels publicitaires avec l'IA",
    template: '%s | AdForge AI',
  },
  description:
    "AdForge AI transforme vos idées en affiches publicitaires professionnelles grâce à l'intelligence artificielle. Facebook Ads, Instagram, TikTok, flyers et plus.",
  keywords: [
    'AI',
    'publicité',
    "génération d'images",
    'marketing',
    'affiches',
    'Instagram',
    'Facebook Ads',
    'IA',
    'design',
    'AdForge',
  ],
  authors: [{ name: 'AdForge AI' }],
  creator: 'AdForge AI',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'AdForge AI',
    title: "AdForge AI — Créez des visuels publicitaires avec l'IA",
    description:
      'Transformez vos idées en affiches publicitaires professionnelles. Agent IA conversationnel, multi-format, Brand Kit intégré.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AdForge AI — Créez des visuels publicitaires avec l'IA",
    description:
      "Transformez vos idées en affiches publicitaires professionnelles avec l'IA.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={frFR}
      signInUrl="/login"
      signUpUrl="/register"
      signInForceRedirectUrl="/app"
      signUpForceRedirectUrl="/app"
    >
      <html
        lang="fr"
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
