/**
 * Makes the images other sites and devices show for this page:
 * - src/app/opengraph-image.jpg: 1200×630 link preview (Open Graph), Olivka and Simba side by side
 * - src/app/apple-icon.png: 180×180 home-screen icon, rendered from src/app/icon.svg
 *
 * Next.js finds both by file name and writes the <meta>/<link> tags for them.
 *
 *   npm run share-images
 *
 * It reads the already-optimized photos in public/photos/, so it never
 * touches originals and can't bring their metadata back.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const APP = path.join(ROOT, 'src', 'app');
const manifest = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'photos.json'), 'utf8'));

// The same photos as the portraits in src/data/cats.ts. Change both together.
const LEFT = 'olivka-bathtub';
const RIGHT = 'simba-teal-bedspread';

const WIDTH = 1200;
const HEIGHT = 630;
const GAP = 8;
const STRIPE = '#241d16';

function largestFile(id) {
  const photo = manifest.find((entry) => entry.id === id);
  if (!photo) throw new Error(`${id} isn't in photos.json`);
  return path.join(PUBLIC, 'photos', `${id}-${photo.widths.at(-1)}.webp`);
}

/** One half of the preview. "attention" keeps the most interesting part, usually the face. */
async function half(id) {
  return sharp(largestFile(id))
    .resize({ width: (WIDTH - GAP) / 2, height: HEIGHT, fit: 'cover', position: 'attention' })
    .toBuffer();
}

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: STRIPE } })
  .composite([
    { input: await half(LEFT), left: 0, top: 0 },
    { input: await half(RIGHT), left: (WIDTH + GAP) / 2, top: 0 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(APP, 'opengraph-image.jpg'));

await sharp(path.join(APP, 'icon.svg'), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(path.join(APP, 'apple-icon.png'));

for (const file of ['opengraph-image.jpg', 'apple-icon.png']) {
  const { width, height, exif, xmp, icc } = await sharp(path.join(APP, file)).metadata();
  if (exif || xmp || icc) throw new Error(`${file} has metadata it shouldn't`);
  console.log(`src/app/${file}: ${width}×${height}, no metadata`);
}
