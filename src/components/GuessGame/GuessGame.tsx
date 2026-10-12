import { useEffect, useReducer, useRef } from 'react';
import { flushSync } from 'react-dom';
import { motion } from 'motion/react';
import { cats, type CatId } from '../../data/cats.ts';
import { getPhoto, photos } from '../../data/photos.ts';
import { getLocalStorage, readBestStreak, saveBestStreak } from '../../lib/bestStreak.ts';
import {
  canPlay,
  createInitialState,
  gameReducer,
  isCorrect,
  pickRound,
  playablePhotos,
} from '../../lib/guessGame.ts';
import { Picture } from '../Picture/Picture.tsx';
import styles from './GuessGame.module.css';

const PLAYABLE = playablePhotos(photos);
const CAN_PLAY = canPlay(PLAYABLE);
const nameOf = (id: CatId) => cats.find((cat) => cat.id === id)?.name ?? id;

export function GuessGame() {
  const [state, dispatch] = useReducer(gameReducer, null, () =>
    createInitialState(
      CAN_PLAY ? pickRound(PLAYABLE, null) : null,
      readBestStreak(getLocalStorage()),
    ),
  );
  const firstGuessButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);

  // localStorage is outside React, so keeping it in sync is an effect's job.
  useEffect(() => {
    saveBestStreak(getLocalStorage(), state.best);
  }, [state.best]);

  const photo = state.round ? getPhoto(state.round.photoId) : null;
  const correct = isCorrect(state);
  const revealed = correct !== null;

  // flushSync renders the new buttons right away, so focus can move to them
  // in the same click handler. Otherwise focus would be lost when the
  // button that was clicked disappears.
  function guess(cat: CatId) {
    flushSync(() => dispatch({ type: 'guess', guess: cat }));
    nextButton.current?.focus();
  }

  function next() {
    flushSync(() =>
      dispatch({ type: 'next', round: pickRound(PLAYABLE, state.round?.photoId ?? null) }),
    );
    firstGuessButton.current?.focus();
  }

  return (
    <section id="game" className={styles.game} aria-labelledby="game-heading">
      <div className={styles.inner}>
        <div className={styles.frame}>
          {photo && (
            <Picture
              key={photo.id}
              photo={photo}
              sizes="(min-width: 48rem) 28rem, 100vw"
              // The real alt text names the cat, so it waits until after the guess.
              alt={revealed ? photo.alt : 'A photo of one of the cats. Which one is it?'}
              className={styles.picture}
            />
          )}
        </div>

        <div className={styles.play}>
          <h2 id="game-heading">Who's that cat?</h2>

          {!CAN_PLAY ? (
            <p>The game needs at least one photo of each cat on its own.</p>
          ) : (
            <>
              <p>Both are golden British Shorthairs. Can you tell them apart?</p>

              {revealed ? (
                <motion.button
                  ref={nextButton}
                  type="button"
                  className={styles.next}
                  onClick={next}
                  whileTap={{ scale: 0.96 }}
                >
                  Next photo
                </motion.button>
              ) : (
                <div className={styles.choices} role="group" aria-label="Your guess">
                  {cats.map((cat, index) => (
                    <motion.button
                      key={cat.id}
                      ref={index === 0 ? firstGuessButton : undefined}
                      type="button"
                      className={styles.choice}
                      data-cat={cat.id}
                      onClick={() => guess(cat.id)}
                      whileTap={{ scale: 0.96 }}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Always rendered, so screen readers announce the result when it changes. */}
              <p className={styles.result} role="status">
                {state.round &&
                  correct !== null &&
                  (correct
                    ? `Yes, that's ${nameOf(state.round.answer)}.`
                    : `No, that's ${nameOf(state.round.answer)}.`)}
              </p>

              <p className={styles.score}>
                Streak{' '}
                <motion.strong
                  key={state.streak}
                  initial={state.streak > 0 ? { scale: 1.4 } : false}
                  animate={{ scale: 1 }}
                  className={styles.number}
                >
                  {state.streak}
                </motion.strong>
                <span aria-hidden="true"> · </span>
                Best <strong className={styles.number}>{state.best}</strong>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
