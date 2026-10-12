import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fonts are bundled with the site, so no request ever goes to a font CDN.
// Caprasimo: latin subset only. Its latin-ext file is under Vite's 4 kB inline
// limit, so the full import would paste it into the render-blocking CSS as
// base64 even though no heading uses those characters.
// Atkinson: the full import is fine. Both subsets are separate files with a
// unicode-range, and browsers only download the ones a page actually uses.
import '@fontsource/caprasimo/latin-400.css';
import '@fontsource-variable/atkinson-hyperlegible-next';

import './styles/tokens.css';
import './styles/reset.css';
import './styles/base.css';

import { App } from './App.tsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element in index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
