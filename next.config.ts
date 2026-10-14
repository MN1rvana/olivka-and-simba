import type { NextConfig } from 'next';

// GitHub Pages serves the site from https://mn1rvana.github.io/olivka-and-simba/,
// so every route and asset URL needs this prefix.
const basePath = '/olivka-and-simba';

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain HTML, CSS and JS to out/. GitHub
  // Pages can only serve static files, so there's no Next.js server at runtime.
  output: 'export',
  basePath,
  // Next adds basePath to its own links and assets, but not to plain <img>
  // URLs. lib/photos.ts reads this to build the photo URLs.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
