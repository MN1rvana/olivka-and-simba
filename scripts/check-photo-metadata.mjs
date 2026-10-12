/**
 * Proves the optimized photos carry no metadata: no EXIF (so no GPS),
 * XMP, IPTC or embedded ICC profile. Exits with an error if any file does.
 *
 *   npm run photos:check
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PHOTOS_DIR = path.resolve(import.meta.dirname, '..', 'public', 'photos');
const METADATA_FIELDS = ['exif', 'xmp', 'iptc', 'icc', 'tifftagPhotoshop'];

const files = (await readdir(PHOTOS_DIR)).filter((file) => /\.(avif|webp)$/.test(file));
let failures = 0;

for (const file of files) {
  const metadata = await sharp(path.join(PHOTOS_DIR, file)).metadata();
  const found = METADATA_FIELDS.filter((field) => metadata[field] !== undefined);

  if (found.length > 0) {
    failures += 1;
    console.error(`✗ ${file} still has: ${found.join(', ')}`);
  }
}

console.log(
  `${files.length - failures} of ${files.length} files have no EXIF, GPS, XMP, IPTC or ICC data.`,
);
process.exitCode = failures > 0 ? 1 : 0;
