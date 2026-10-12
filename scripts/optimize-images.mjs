/**
 * Turns the originals in raw-photos/ into web-ready images and a manifest.
 *
 *   npm run photos
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
 */
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

async function isNewerThan(file, time) {
  try {
    return (await stat(file)).mtimeMs >= time;
  } catch {
    return false;
  }
}

async function processPhoto({ file, id, cat }, previous) {
  const input = path.join(INPUT_DIR, file);
  const inputTime = (await stat(input)).mtimeMs;

  // autoOrient holds the dimensions after the EXIF orientation is applied.
  const { autoOrient } = await sharp(input).metadata();
  const widths = widthsFor(autoOrient.width);
  const largest = widths[widths.length - 1];
  const height = Math.round((autoOrient.height * largest) / autoOrient.width);
  const outputs = widths.flatMap((w) =>
    Object.keys(FORMATS).map((format) => path.join(OUTPUT_DIR, outputName(id, w, format))),
  );

  const upToDate =
    previous?.placeholder &&
    previous.width === largest &&
    (await Promise.all(outputs.map((out) => isNewerThan(out, inputTime)))).every(Boolean);

  let placeholder = previous?.placeholder;

  if (upToDate) {
    console.log(`  ${id}: up to date`);
  } else {
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
    placeholder = `data:image/webp;base64,${tiny.toString('base64')}`;

    console.log(`  ${id}: ${autoOrient.width}×${autoOrient.height} → ${widths.join(', ')}px`);
  }

  return {
    entry: {
      id,
      cat,
      width: largest,
      height,
      widths,
      alt: previous?.alt ?? ALT_TODO,
      ...(previous?.caption ? { caption: previous.caption } : {}),
      placeholder,
    },
    outputs,
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const previous = await readManifest();
  const files = (await readdir(INPUT_DIR)).sort();
  const photos = [];
  const keep = new Set();

  console.log(`Optimizing photos from raw-photos/`);

  for (const file of files) {
    if (file.startsWith('.')) continue;

    const match = FILENAME.exec(file);

    if (!match) {
      console.warn(`  skipped ${file}: name it olivka-*, simba-* or both-* (jpg, png, webp, tiff)`);
      continue;
    }

    const cat = match[1].toLowerCase();
    const id = `${cat}-${match[2].toLowerCase()}`;
    const { entry, outputs } = await processPhoto({ file, id, cat }, previous.get(id));
    photos.push(entry);
    outputs.forEach((out) => keep.add(path.basename(out)));
  }

  // Remove output files whose original was deleted or renamed.
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
