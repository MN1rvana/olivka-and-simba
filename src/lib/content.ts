import type { Cat } from '../data/cats.ts';

const OPTIONAL_FIELDS = ['birthday', 'bio', 'traits', 'favorites', 'habits'] as const;

/** Which optional fields of a cat are still empty, e.g. ['birthday', 'traits']. */
export function missingContent(cat: Cat): string[] {
  return OPTIONAL_FIELDS.filter((field) => {
    const value = cat[field];
    return value === null || value.length === 0;
  });
}
