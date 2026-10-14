/*
 * Everything the site says about the cats lives here. Components only
 * decide how it looks.
 *
 * Rule for this file: no invented facts. Anything Maryna hasn't written
 * yet stays empty, marked TODO(Maryna). Empty fields aren't shown on the
 * site, and `next dev` lists them in the terminal (see lib/content.ts).
 */

export type CatId = 'olivka' | 'simba';

export interface Cat {
  id: CatId;
  name: string;
  /** ISO date, YYYY-MM-DD. The site works out the age from it, so it never goes stale. */
  birthday: string | null;
  coat: string;
  /** id of the photo in photos.json shown in this cat's section. */
  portraitId: string;
  /** Paragraphs, in Maryna's voice. */
  bio: readonly string[];
  /** 3–5 short words or phrases. Rendered as one sentence: "Olivka is a, b, and c." */
  traits: readonly string[];
  favorites: readonly string[];
  habits: readonly string[];
}

export const cats: readonly Cat[] = [
  {
    id: 'olivka',
    name: 'Olivka',
    birthday: null, // TODO(Maryna): 'YYYY-MM-DD'
    coat: 'Golden British Shorthair',
    portraitId: 'olivka-bathtub',
    bio: [], // TODO(Maryna): 2–3 sentences. How Olivka came home, and what Olivka is like.
    traits: [], // TODO(Maryna): 3–5 traits
    favorites: [], // TODO(Maryna): favorite things
    habits: [], // TODO(Maryna): habits
  },
  {
    id: 'simba',
    name: 'Simba',
    birthday: null, // TODO(Maryna): 'YYYY-MM-DD'
    coat: 'Golden British Shorthair',
    portraitId: 'simba-teal-bedspread',
    bio: [], // TODO(Maryna): 2–3 sentences. How Simba came home, and what Simba is like.
    traits: [], // TODO(Maryna): 3–5 traits
    favorites: [], // TODO(Maryna): favorite things
    habits: [], // TODO(Maryna): habits
  },
];
