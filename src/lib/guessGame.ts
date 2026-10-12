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
 * Picks the next photo at random, never the same one twice in a row.
 * `random` is injected (Math.random by default), so tests can make it predictable.
 */
export function pickRound(
  photos: readonly PlayablePhoto[],
  previousId: string | null,
  random: () => number = Math.random,
): Round {
  const candidates = photos.length > 1 ? photos.filter((photo) => photo.id !== previousId) : photos;
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
