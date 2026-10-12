import { describe, expect, it } from 'vitest';
import type { Photo } from '../data/photos.ts';
import {
  canPlay,
  createInitialState,
  gameReducer,
  isCorrect,
  pickRound,
  playablePhotos,
  type GameState,
} from './guessGame.ts';

function photo(id: string, cat: Photo['cat']): Photo {
  return { id, cat, width: 100, height: 100, widths: [100], alt: id, placeholder: '' };
}

const olivkaPhoto = photo('olivka-1', 'olivka');
const simbaPhoto = photo('simba-1', 'simba');
const bothPhoto = photo('both-1', 'both');
const playable = playablePhotos([olivkaPhoto, simbaPhoto, bothPhoto]);

const startingWith = (answer: 'olivka' | 'simba', overrides: Partial<GameState> = {}) => ({
  ...createInitialState({ photoId: `${answer}-1`, answer }, 0),
  ...overrides,
});

describe('playablePhotos and canPlay', () => {
  it('leaves out photos of both cats', () => {
    expect(playable.map((p) => p.id)).toEqual(['olivka-1', 'simba-1']);
  });

  it('needs at least one photo of each cat', () => {
    expect(canPlay(playable)).toBe(true);
    expect(canPlay(playablePhotos([olivkaPhoto, bothPhoto]))).toBe(false);
    expect(canPlay([])).toBe(false);
  });
});

describe('pickRound', () => {
  /** A random function that returns the given numbers in order. */
  const sequence = (...values: number[]) => {
    let call = 0;
    return () => values[call++ % values.length]!;
  };

  const twoOlivkas = playablePhotos([olivkaPhoto, photo('olivka-2', 'olivka'), simbaPhoto]);

  it('picks a cat first, then a photo of that cat', () => {
    expect(pickRound(playable, null, sequence(0, 0))).toEqual({
      photoId: 'olivka-1',
      answer: 'olivka',
    });
    expect(pickRound(playable, null, sequence(0.99, 0))).toEqual({
      photoId: 'simba-1',
      answer: 'simba',
    });
  });

  it('can ask about the same cat twice in a row, so answers never just alternate', () => {
    expect(pickRound(playable, 'olivka-1', sequence(0, 0)).answer).toBe('olivka');
  });

  it('avoids the previous photo when that cat has another one', () => {
    for (const second of [0, 0.5, 0.99]) {
      expect(pickRound(twoOlivkas, 'olivka-1', sequence(0, second)).photoId).toBe('olivka-2');
    }
  });

  it('throws when there is nothing to pick', () => {
    expect(() => pickRound([], null)).toThrow();
  });
});

describe('gameReducer', () => {
  it('counts a right guess towards the streak and the best', () => {
    const next = gameReducer(startingWith('simba'), { type: 'guess', guess: 'simba' });
    expect(next).toMatchObject({ guess: 'simba', streak: 1, best: 1 });
    expect(isCorrect(next)).toBe(true);
  });

  it('resets the streak on a wrong guess but keeps the best', () => {
    const state = startingWith('simba', { streak: 4, best: 6 });
    const next = gameReducer(state, { type: 'guess', guess: 'olivka' });
    expect(next).toMatchObject({ streak: 0, best: 6 });
    expect(isCorrect(next)).toBe(false);
  });

  it('raises the best when the streak passes it', () => {
    const state = startingWith('olivka', { streak: 6, best: 6 });
    expect(gameReducer(state, { type: 'guess', guess: 'olivka' }).best).toBe(7);
  });

  it('ignores a second guess on the same photo', () => {
    const guessed = gameReducer(startingWith('olivka'), { type: 'guess', guess: 'olivka' });
    expect(gameReducer(guessed, { type: 'guess', guess: 'simba' })).toBe(guessed);
  });

  it('starts a new round without touching the streak', () => {
    const guessed = gameReducer(startingWith('olivka'), { type: 'guess', guess: 'olivka' });
    const next = gameReducer(guessed, {
      type: 'next',
      round: { photoId: 'simba-1', answer: 'simba' },
    });
    expect(next).toMatchObject({ guess: null, streak: 1, round: { answer: 'simba' } });
    expect(isCorrect(next)).toBeNull();
  });

  it('does nothing when there is no round to guess', () => {
    const empty = createInitialState(null, 3);
    expect(gameReducer(empty, { type: 'guess', guess: 'olivka' })).toBe(empty);
  });
});
