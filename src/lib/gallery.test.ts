import { describe, expect, it } from 'vitest';
import {
  countByFilter,
  filterPhotos,
  parseFilter,
  searchWithFilter,
  wrapIndex,
} from './gallery.ts';

const photos = [
  { id: 'olivka-1', cat: 'olivka' },
  { id: 'simba-1', cat: 'simba' },
  { id: 'both-1', cat: 'both' },
  { id: 'olivka-2', cat: 'olivka' },
] as const;

const ids = (list: readonly { id: string }[]) => list.map((photo) => photo.id);

describe('parseFilter', () => {
  it('reads the cat from the query string', () => {
    expect(parseFilter('?cat=simba')).toBe('simba');
    expect(parseFilter('?utm_source=cv&cat=both')).toBe('both');
  });

  it('falls back to all when the value is missing or unknown', () => {
    expect(parseFilter('')).toBe('all');
    expect(parseFilter('?cat=')).toBe('all');
    expect(parseFilter('?cat=dog')).toBe('all');
    expect(parseFilter('?cat=SIMBA')).toBe('all');
  });
});

describe('searchWithFilter', () => {
  it('adds the filter and keeps other params', () => {
    expect(searchWithFilter('?utm_source=cv', 'olivka')).toBe('?utm_source=cv&cat=olivka');
  });

  it('replaces an existing filter', () => {
    expect(searchWithFilter('?cat=olivka', 'simba')).toBe('?cat=simba');
  });

  it('removes the param for all, leaving a clean URL', () => {
    expect(searchWithFilter('?cat=simba', 'all')).toBe('');
    expect(searchWithFilter('?cat=simba&utm_source=cv', 'all')).toBe('?utm_source=cv');
  });
});

describe('filterPhotos', () => {
  it('shows everything, in order, for all', () => {
    expect(ids(filterPhotos(photos, 'all'))).toEqual(['olivka-1', 'simba-1', 'both-1', 'olivka-2']);
  });

  it('includes photos of both cats under each cat', () => {
    expect(ids(filterPhotos(photos, 'olivka'))).toEqual(['olivka-1', 'both-1', 'olivka-2']);
    expect(ids(filterPhotos(photos, 'simba'))).toEqual(['simba-1', 'both-1']);
  });

  it('shows only photos of both cats for both', () => {
    expect(ids(filterPhotos(photos, 'both'))).toEqual(['both-1']);
  });
});

describe('countByFilter', () => {
  it('matches what each filter would show', () => {
    expect(countByFilter(photos)).toEqual({ all: 4, olivka: 3, simba: 2, both: 1 });
  });
});

describe('wrapIndex', () => {
  it('goes from the last photo to the first', () => {
    expect(wrapIndex(3, 3)).toBe(0);
  });

  it('goes from the first photo to the last', () => {
    expect(wrapIndex(-1, 3)).toBe(2);
  });

  it('leaves indexes inside the range alone', () => {
    expect(wrapIndex(1, 3)).toBe(1);
  });
});
