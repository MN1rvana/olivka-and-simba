import { describe, expect, it } from 'vitest';
import { getAgeInYears } from './age.ts';

describe('getAgeInYears', () => {
  const birthday = '2022-03-14';

  it('counts a year only once the birthday has passed', () => {
    expect(getAgeInYears(birthday, new Date(2026, 2, 13))).toBe(3);
    expect(getAgeInYears(birthday, new Date(2026, 2, 14))).toBe(4);
    expect(getAgeInYears(birthday, new Date(2026, 9, 13))).toBe(4);
  });

  it('is 0 before the first birthday', () => {
    expect(getAgeInYears(birthday, new Date(2022, 11, 31))).toBe(0);
  });

  it('rejects dates that are not YYYY-MM-DD', () => {
    expect(() => getAgeInYears('March 2022', new Date())).toThrow();
  });
});
