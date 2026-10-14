import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'motion/react';
import { afterEach } from 'vitest';

// Tests check what happens, not how it animates: motion jumps straight to the end state.
MotionGlobalConfig.skipAnimations = true;

// Tells React that tests wrap updates in act(). Testing Library sets this when
// imported; the hydration tests use react-dom directly, so it's set here for all.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

// index.html sets these. The test document starts without them.
document.documentElement.lang = 'en';
document.title = 'Olivka & Simba';

// jsdom has no matchMedia. motion's useReducedMotion reads it.
if (!('matchMedia' in window)) {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

/*
 * jsdom has <dialog> as a plain element: no showModal(), no close(), and
 * Esc does nothing. These stand-ins copy the browser behaviour the
 * Lightbox relies on. The focus-trapping half of showModal() (making the
 * rest of the page inert) can only be checked in a real browser.
 */
// Object.hasOwn rather than `in`, which TypeScript would narrow to `never` here.
if (!Object.hasOwn(HTMLDialogElement.prototype, 'showModal')) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  [...document.querySelectorAll('dialog')].find((dialog) => dialog.open)?.close();
});
