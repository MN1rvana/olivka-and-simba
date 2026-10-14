import type { Metadata } from 'next';
import Link from 'next/link';

// Next marks not-found pages noindex by itself. The home page's canonical and
// Open Graph tags would be wrong here, so they're switched off.
export const metadata: Metadata = {
  title: 'Page not found · Olivka & Simba',
  alternates: { canonical: null },
  openGraph: null,
};

/** Exported as 404.html, which GitHub Pages serves for any address that doesn't exist. */
export default function NotFound() {
  return (
    <main className="not-found">
      <svg className="not-found-eyes" viewBox="0 0 260 80" aria-hidden="true" focusable="false">
        {/* Both eyes closed: the hero's blink at its lowest point. */}
        <path d="M14 30 Q62 74 110 30" />
        <path d="M150 30 Q198 74 246 30" />
      </svg>
      <h1>Nothing here</h1>
      <p>This page doesn&apos;t exist, or it has moved.</p>
      {/* next/link adds the base path, so this works however deep the missing address was. */}
      <p>
        <Link href="/">Go to Olivka and Simba</Link>
      </p>
    </main>
  );
}
