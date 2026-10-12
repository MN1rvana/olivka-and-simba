const STORAGE_KEY = 'olivka-and-simba:best-streak';

/**
 * localStorage can throw: in some private modes, when storage is blocked,
 * or when it's full. The game must keep working either way. The best
 * streak just won't survive a reload.
 */
export function getLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readBestStreak(storage: Pick<Storage, 'getItem'> | null): number {
  try {
    const value = Number(storage?.getItem(STORAGE_KEY));
    // Anything odd in storage (text, negative, a fraction) counts as no best yet.
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function saveBestStreak(storage: Pick<Storage, 'setItem'> | null, best: number): void {
  try {
    storage?.setItem(STORAGE_KEY, String(best));
  } catch {
    // Blocked or full: nothing to do. See getLocalStorage.
  }
}
