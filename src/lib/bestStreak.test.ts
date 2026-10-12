import { describe, expect, it, vi } from 'vitest';
import { readBestStreak, saveBestStreak } from './bestStreak.ts';

const KEY = 'olivka-and-simba:best-streak';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    data,
  };
}

describe('readBestStreak', () => {
  it('reads a saved best streak', () => {
    expect(readBestStreak(memoryStorage({ [KEY]: '7' }))).toBe(7);
  });

  it('treats a missing or odd value as no best yet', () => {
    expect(readBestStreak(memoryStorage())).toBe(0);
    for (const value of ['abc', '-3', '2.5', '', 'Infinity']) {
      expect(readBestStreak(memoryStorage({ [KEY]: value }))).toBe(0);
    }
  });

  it('copes with storage being unavailable', () => {
    expect(readBestStreak(null)).toBe(0);
    const throwing = {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
    };
    expect(readBestStreak(throwing)).toBe(0);
  });
});

describe('saveBestStreak', () => {
  it('saves the number as text', () => {
    const storage = memoryStorage();
    saveBestStreak(storage, 12);
    expect(storage.data.get(KEY)).toBe('12');
  });

  it('does not throw when storage is full or blocked', () => {
    const setItem = vi.fn(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(() => saveBestStreak({ setItem }, 3)).not.toThrow();
    expect(() => saveBestStreak(null, 3)).not.toThrow();
  });
});
