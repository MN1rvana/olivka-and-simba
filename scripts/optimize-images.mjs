/**
 * Turns the originals in raw-photos/ into web-ready images and a manifest.
 *
 *   npm run photos              process every original in raw-photos/
 *   npm run photos -- --prune   also remove photos whose original is gone
 *
 * Input:  raw-photos/olivka-*.jpg, simba-*.jpg, both-*.jpg (gitignored)
 * Output: public/photos/<id>-<width>.{avif,webp} and src/data/photos.json
 *
 * - .rotate() runs first. With no angle it applies the EXIF orientation to
 *   the pixels, so a photo shot with the phone sideways stays upright after
 *   the EXIF tag is gone.
 * - Each photo is written as AVIF and WebP at 480, 960 and 1600px wide,
 *   never upscaled. A smaller original gets its own width as the largest size.
 * - No metadata is written. sharp only copies EXIF (including GPS), XMP,
 *   IPTC or ICC when asked to with keepMetadata()/keepExif(), and this
 *   script never asks. scripts/check-photo-metadata.mjs proves it.
 * - Alt text and captions already in photos.json are kept, so running the
 *   script again never overwrites what Maryna wrote.
 * - A photo whose original isn't in raw-photos/ (a new laptop, a tidied
 *   folder) stays in the manifest and on disk. Only --prune removes it.
 * - Every run re-encodes everything. sharp's output is the same for the
 *   same input, so unchanged photos don't show up in git, and there's no
 *   cache to go stale.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const INPUT_DIR = path.join(ROOT, 'raw-photos');
const OUTPUT_DIR = path.join(ROOT, 'public', 'photos');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'photos.json');

const WIDTHS = [480, 960, 1600];
const MAX_WIDTH = WIDTHS[WIDTHS.length - 1];
const FORMATS = {
  // Roughly the same visual quality for both. AVIF is usually 20–30% smaller.
  avif: { quality: 50, effort: 6 },
  webp: { quality: 75, effort: 6 },
};
const FILENAME = /^(olivka|simba|both)-([a-z0-9-]+)\.(jpe?g|png|webp|tiff?)$/i;
const ALT_TODO = 'TODO(Maryna): describe what is in the photo';

async function readManifest() {
  try {
    const entries = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
    return new Map(entries.map((entry) => [entry.id, entry]));
  } catch (error) {
    if (error.code === 'ENOENT') return new Map();
    throw error;
  }
}

/** Every width we serve: the standard ones below the original, plus the largest we can honestly give. */
function widthsFor(originalWidth) {
  const largest = Math.min(originalWidth, MAX_WIDTH);
  return [...new Set([...WIDTHS.filter((w) => w < largest), largest])];
}

const outputName = (id, width, format) => `${id}-${width}.${format}`;

async function processPhoto({ file, id, cat }, previous) {
  const input = path.join(INPUT_DIR, file);

  // autoOrient holds the dimensions after the EXIF orientation is applied.
  const { autoOrient } = await sharp(input).metadata();
  const widths = widthsFor(autoOrient.width);
  const largest = widths[widths.length - 1];
  const height = Math.round((autoOrient.height * largest) / autoOrient.width);
  const image = sharp(input).rotate();

  await Promise.all(
    widths.flatMap((w) =>
      Object.entries(FORMATS).map(([format, options]) =>
        image
          .clone()
          .resize({ width: w })
          .toFormat(format, options)
          .toFile(path.join(OUTPUT_DIR, outputName(id, w, format))),
      ),
    ),
  );

  // A 16px-wide copy, inlined as base64. Shown blurred while the real image loads.
  const tiny = await image.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();

  console.log(`  ${id}: ${autoOrient.width}×${autoOrient.height} → ${widths.join(', ')}px`);

  return {
    id,
    cat,
    width: largest,
    height,
    widths,
    alt: previous?.alt ?? ALT_TODO,
    ...(previous?.caption ? { caption: previous.caption } : {}),
    placeholder: `data:image/webp;base64,${tiny.toString('base64')}`,
  };
}

/** The file names an entry's widths and formats correspond to. */
const outputsOf = (entry) =>
  entry.widths.flatMap((w) =>
    Object.keys(FORMATS).map((format) => outputName(entry.id, w, format)),
  );

async function readOriginals() {
  try {
    return (await readdir(INPUT_DIR)).sort();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function main() {
  const prune = process.argv.includes('--prune');
  await mkdir(OUTPUT_DIR, { recursive: true });

  const previous = await readManifest();
  const photos = [];

  console.log(`Optimizing photos from raw-photos/`);

  for (const file of await readOriginals()) {
    if (file.startsWith('.')) continue;

    const match = FILENAME.exec(file);

    if (!match) {
      console.warn(`  skipped ${file}: name it olivka-*, simba-* or both-* (jpg, png, webp, tiff)`);
      continue;
    }

    const cat = match[1].toLowerCase();
    const id = `${cat}-${match[2].toLowerCase()}`;
    photos.push(await processPhoto({ file, id, cat }, previous.get(id)));
  }

  // Photos already in the manifest whose original isn't here right now.
  const processed = new Set(photos.map((photo) => photo.id));
  for (const [id, entry] of previous) {
    if (processed.has(id)) continue;

    if (prune) {
      console.log(`  removed ${id}: its original is gone (--prune)`);
    } else {
      photos.push(entry);
      console.warn(
        `  kept ${id}: its original isn't in raw-photos/ (npm run photos -- --prune removes it)`,
      );
    }
  }

  // Delete output files that no manifest entry points to.
  const keep = new Set(photos.flatMap(outputsOf));
  for (const file of await readdir(OUTPUT_DIR)) {
    if (!keep.has(file)) {
      await rm(path.join(OUTPUT_DIR, file));
      console.log(`  removed stale ${file}`);
    }
  }

  photos.sort((a, b) => a.id.localeCompare(b.id));
  await writeFile(MANIFEST_PATH, `${JSON.stringify(photos, null, 2)}\n`);
  console.log(`Wrote ${photos.length} photos to src/data/photos.json`);
}

await main();
