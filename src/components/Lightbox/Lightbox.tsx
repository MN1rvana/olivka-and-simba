import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { motion } from 'motion/react';
import type { Photo } from '../../data/photos.ts';
import { wrapIndex } from '../../lib/gallery.ts';
import { Picture } from '../Picture/Picture.tsx';
import styles from './Lightbox.module.css';

/** How far a finger has to travel sideways, in px, before it counts as a swipe. */
const SWIPE_THRESHOLD = 50;

interface LightboxProps {
  photos: readonly Photo[];
  /** Index of the photo on screen, or null when the lightbox is closed. */
  index: number | null;
  /** When set, the photo grows out of the thumbnail with the same layoutId. */
  sharedLayoutId?: string | undefined;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

/**
 * Built on the native <dialog> element. showModal() makes the rest of the
 * page inert, so focus stays inside without a hand-written focus trap, and
 * Esc closes it. The Gallery returns focus to the thumbnail that opened it.
 */
export function Lightbox({ photos, index, sharedLayoutId, onNavigate, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const isOpen = index !== null;
  const photo = index === null ? undefined : photos[index];
  const canNavigate = photos.length > 1;

  // <dialog> is opened and closed by calling methods on it, so this keeps it
  // in sync with the index prop. A layout effect, so the dialog is already
  // open (and measurable) when motion measures the photo for the shared
  // layout animation.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function step(delta: number) {
    if (index !== null && canNavigate) {
      onNavigate(wrapIndex(index + delta, photos.length));
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
    // Esc needs no code: the browser closes the dialog and fires `close`.
  }

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    // The click landed on the dialog itself, outside the photo and buttons.
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  }

  function handlePointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse') {
      swipeStart.current = { x: event.clientX, y: event.clientY };
    }
  }

  function handlePointerUp(event: PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    // Mostly horizontal and far enough: swipe left for the next photo, right for the previous.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.lightbox}
      aria-label="Photo viewer"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      <motion.button
        ref={closeButtonRef}
        type="button"
        className={styles.button}
        onClick={() => dialogRef.current?.close()}
        whileTap={{ scale: 0.96 }}
      >
        Close
      </motion.button>

      {photo && index !== null && (
        <>
          <figure
            className={styles.figure}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
          >
            <Picture
              key={photo.id}
              photo={photo}
              sizes="100vw"
              priority
              className={styles.picture}
              layoutId={sharedLayoutId}
            />
            <figcaption className={styles.caption}>
              {photo.caption && <span>{photo.caption}</span>}
              <span className={styles.counter}>
                {index + 1} of {photos.length}
              </span>
            </figcaption>
          </figure>

          {canNavigate && (
            <div className={styles.nav}>
              <motion.button
                type="button"
                className={styles.button}
                onClick={() => step(-1)}
                whileTap={{ scale: 0.96 }}
              >
                Previous
              </motion.button>
              <motion.button
                type="button"
                className={styles.button}
                onClick={() => step(1)}
                whileTap={{ scale: 0.96 }}
              >
                Next
              </motion.button>
            </div>
          )}

          {/* Arrow keys and swipes don't move focus, so announce the new photo. */}
          <p className="visually-hidden" aria-live="polite">
            {`Photo ${index + 1} of ${photos.length}: ${photo.alt}`}
          </p>
        </>
      )}
    </dialog>
  );
}
