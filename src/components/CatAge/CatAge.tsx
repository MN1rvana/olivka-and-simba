'use client';

import { useSyncExternalStore } from 'react';
import { getAgeInYears } from '../../lib/age.ts';

const noSubscription = () => () => undefined;

/**
 * The age depends on today's date. Built into the static HTML it would go
 * stale after the next birthday, so it's worked out in the browser.
 * useSyncExternalStore gives the server (and hydration) "no age yet", then
 * the browser's own value, without a hydration mismatch.
 */
export function CatAge({ birthday }: { birthday: string }) {
  const age = useSyncExternalStore(
    noSubscription,
    () => getAgeInYears(birthday, new Date()),
    () => null,
  );

  return age === null ? null : <> ({age})</>;
}
