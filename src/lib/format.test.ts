import { describe, expect, it } from 'vitest';
import { formatBirthday, joinAsSentenceList } from './format.ts';

describe('joinAsSentenceList', () => {
  it('joins traits the way a sentence would', () => {
    expect(joinAsSentenceList(['calm'])).toBe('calm');
    expect(joinAsSentenceList(['calm', 'curious'])).toBe('calm and curious');
    expect(joinAsSentenceList(['calm', 'curious', 'loud'])).toBe('calm, curious, and loud');
  });
});

describe('formatBirthday', () => {
  it('writes the date out in full, without a time-zone shift', () => {
    expect(formatBirthday('2022-03-14')).toBe('14 March 2022');
    expect(formatBirthday('2023-01-01')).toBe('1 January 2023');
  });
});
