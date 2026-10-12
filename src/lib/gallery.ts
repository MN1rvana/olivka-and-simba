import type { PhotoCat } from '../data/photos.ts';

export type PhotoFilter = 'all' | PhotoCat;

export const PHOTO_FILTERS = [
  'all',
  'olivka',
  'simba',
  'both',
] as const satisfies readonly PhotoFilter[];

const FILTER_PARAM = 'cat';

function isPhotoFilter(value: string | null): value is PhotoFilter {
  return PHOTO_FILTERS.some((filter) => filter === value);
}

/** '?cat=simba' → 'simba'. Anything missing or unknown means 'all', so a broken link still shows photos. */
export function parseFilter(search: string): PhotoFilter {
  const value = new URLSearchParams(search).get(FILTER_PARAM);
  return isPhotoFilter(value) ? value : 'all';
}

/** Returns `search` with the filter set, keeping any other params. 'all' removes the param. */
export function searchWithFilter(search: string, filter: PhotoFilter): string {
  const params = new URLSearchParams(search);

  if (filter === 'all') {
    params.delete(FILTER_PARAM);
  } else {
    params.set(FILTER_PARAM, filter);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * The Olivka filter means "photos with Olivka in them", so it includes
 * photos of both cats. "Both" shows only the photos where they're together.
 */
export function matchesFilter(cat: PhotoCat, filter: PhotoFilter): boolean {
  if (filter === 'all' || filter === cat) return true;
  return cat === 'both' && (filter === 'olivka' || filter === 'simba');
}

export function filterPhotos<T extends { cat: PhotoCat }>(
  photos: readonly T[],
  filter: PhotoFilter,
): T[] {
  return photos.filter((photo) => matchesFilter(photo.cat, filter));
}

export function countByFilter(photos: readonly { cat: PhotoCat }[]): Record<PhotoFilter, number> {
  return {
    all: photos.length,
    olivka: filterPhotos(photos, 'olivka').length,
    simba: filterPhotos(photos, 'simba').length,
    both: filterPhotos(photos, 'both').length,
  };
}

/** Index arithmetic that wraps around: from the last photo, "next" goes to the first. */
export function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
