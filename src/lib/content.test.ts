import { describe, expect, it } from 'vitest';
import type { Cat } from '../data/cats.ts';
import { missingContent } from './content.ts';

const base: Cat = {
  id: 'olivka',
  name: 'Olivka',
  birthday: null,
  coat: 'Golden British Shorthair',
  portraitId: 'olivka-1',
  bio: [],
  traits: [],
  favorites: [],
  habits: [],
};

describe('missingContent', () => {
  it('lists every empty field', () => {
    expect(missingContent(base)).toEqual(['birthday', 'bio', 'traits', 'favorites', 'habits']);
  });

  it('lists nothing once everything is written', () => {
    const complete: Cat = {
      ...base,
      birthday: '2022-03-14',
      bio: ['A bio.'],
      traits: ['calm'],
      favorites: ['the sofa'],
      habits: ['naps'],
    };
    expect(missingContent(complete)).toEqual([]);
  });
});
