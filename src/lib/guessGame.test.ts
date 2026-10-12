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
  it('uses the random number to choose a photo', () => {
    expect(pickRound(playable, null, () => 0)).toEqual({ photoId: 'olivka-1', answer: 'olivka' });
    expect(pickRound(playable, null, () => 0.99)).toEqual({ photoId: 'simba-1', answer: 'simba' });
  });

  it('never shows the same photo twice in a row', () => {
    for (const random of [0, 0.3, 0.6, 0.99]) {
      expect(pickRound(playable, 'olivka-1', () => random).photoId).toBe('simba-1');
    }
  });

  it('repeats the photo when there is only one', () => {
    expect(pickRound([playable[0]!], 'olivka-1', () => 0).photoId).toBe('olivka-1');
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
