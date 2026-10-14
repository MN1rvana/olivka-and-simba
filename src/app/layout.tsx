import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import '../styles/tokens.css';
import '../styles/reset.css';
import '../styles/base.css';
import '../styles/not-found.css';

/*
 * The font files come from Fontsource, so they're in the repo and the build
 * never downloads anything. next/font adds what the plain CSS imports
 * couldn't: a <link rel="preload"> for each file, and a fallback font with
 * adjusted metrics, so text doesn't shift when the real font arrives.
 * Latin only, since the site is in English.
 */
const caprasimo = localFont({
  src: '../../node_modules/@fontsource/caprasimo/files/caprasimo-latin-400-normal.woff2',
  weight: '400',
  variable: '--font-caprasimo',
  adjustFontFallback: 'Times New Roman',
});

const atkinson = localFont({
  src: '../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2',
  weight: '200 800',
  variable: '--font-atkinson',
  adjustFontFallback: 'Arial',
});

const ORIGIN = 'https://mn1rvana.github.io';
const SITE_URL = `${ORIGIN}/olivka-and-simba/`;
const DESCRIPTION =
  'Meet Olivka and Simba, two golden British Shorthairs: who they are, their photos, and a game where you guess which cat is which.';

// icon.svg, apple-icon.png and opengraph-image.jpg in this folder are picked up
// by file convention. Next writes their <link>/<meta> tags and adds the base
// path itself, so metadataBase is only the origin: with the path included it
// came out twice. The URLs written here get no base path, so they're absolute.
export const metadata: Metadata = {
  metadataBase: new URL(ORIGIN),
  title: 'Olivka & Simba',
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: 'Olivka & Simba',
    title: 'Olivka & Simba',
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#241d16',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
