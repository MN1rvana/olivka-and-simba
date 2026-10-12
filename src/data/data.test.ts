import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { cats } from './cats.ts';
import { getPhoto, photos } from './photos.ts';

describe('content', () => {
  it('has a portrait in photos.json for every cat', () => {
    for (const cat of cats) {
      expect(() => getPhoto(cat.portraitId), cat.id).not.toThrow();
    }
  });

  it('has real alt text on every photo, not the placeholder the pipeline writes', () => {
    for (const photo of photos) {
      expect(photo.alt, photo.id).not.toMatch(/TODO/);
      expect(photo.alt.length, photo.id).toBeGreaterThan(10);
    }
  });

  it('has every file the manifest points to', () => {
    for (const photo of photos) {
      for (const width of photo.widths) {
        for (const format of ['avif', 'webp']) {
          const file = path.resolve('public/photos', `${photo.id}-${width}.${format}`);
          expect(existsSync(file), file).toBe(true);
        }
      }
    }
  });
});
