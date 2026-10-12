import type { CatId } from '../data/cats.ts';
import type { Photo } from '../data/photos.ts';

/** A photo of exactly one cat. Photos of both can't be guessed. */
export type PlayablePhoto = Photo & { cat: CatId };

export interface Round {
  photoId: string;
  answer: CatId;
}

export interface GameState {
  round: Round | null;
  /** null while the player is still guessing, otherwise the guess they made. */
  guess: CatId | null;
  streak: number;
  best: number;
}

export type GameAction = { type: 'guess'; guess: CatId } | { type: 'next'; round: Round };

export function playablePhotos(photos: readonly Photo[]): PlayablePhoto[] {
  return photos.filter((photo): photo is PlayablePhoto => photo.cat !== 'both');
}

/** The game only makes sense with at least one photo of each cat. */
export function canPlay(photos: readonly PlayablePhoto[]): boolean {
  return (
    photos.some((photo) => photo.cat === 'olivka') && photos.some((photo) => photo.cat === 'simba')
  );
}

/**
 * Picks the next round in two steps: a cat at random, then a photo of that
 * cat, avoiding the previous photo when that cat has another one.
 *
 * Choosing the cat first keeps every answer a fair coin toss. Simply never
 * repeating a photo made the answers alternate (Olivka, Simba, Olivka…)
 * when each cat had a single photo, so one right guess gave the rest away.
 *
 * `random` is injected (Math.random by default), so tests can make it predictable.
 */
export function pickRound(
  photos: readonly PlayablePhoto[],
  previousId: string | null,
  random: () => number = Math.random,
): Round {
  const catsInPhotos = [...new Set(photos.map((photo) => photo.cat))];
  const cat = catsInPhotos[Math.floor(random() * catsInPhotos.length)];
  const ofCat = photos.filter((photo) => photo.cat === cat);
  const candidates = ofCat.length > 1 ? ofCat.filter((photo) => photo.id !== previousId) : ofCat;
  const photo = candidates[Math.floor(random() * candidates.length)];

  if (!photo) {
    throw new Error('pickRound needs at least one photo');
  }

  return { photoId: photo.id, answer: photo.cat };
}

export function createInitialState(round: Round | null, best: number): GameState {
  return { round, guess: null, streak: 0, best };
}

/** All game rules live here, as a pure function: (state, action) → next state. */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'guess': {
      // One guess per photo. A second click before "Next photo" changes nothing.
      if (!state.round || state.guess !== null) return state;

      const streak = action.guess === state.round.answer ? state.streak + 1 : 0;
      return { ...state, guess: action.guess, streak, best: Math.max(state.best, streak) };
    }
    case 'next':
      return { ...state, round: action.round, guess: null };
  }
}

/** true or false once a guess is made, null before. */
export function isCorrect(state: GameState): boolean | null {
  if (!state.round || state.guess === null) return null;
  return state.guess === state.round.answer;
}
