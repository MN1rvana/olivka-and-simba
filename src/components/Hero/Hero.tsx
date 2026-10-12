import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cats } from '../../data/cats.ts';
import { CatEyes, type CatEyesHandle } from '../CatEyes/CatEyes.tsx';
import styles from './Hero.module.css';

// Seconds before each cat blinks back: Simba straight away, Olivka a beat
// later.
const BLINK_DELAY = { simba: 0.2, olivka: 1 } as const;

export function Hero() {
  const olivkaEyes = useRef<CatEyesHandle>(null);
  const simbaEyes = useRef<CatEyesHandle>(null);
  const [hasBlinked, setHasBlinked] = useState(false);
  const [olivka, simba] = cats;

  function blinkAtThem() {
    simbaEyes.current?.blink(BLINK_DELAY.simba);
    olivkaEyes.current?.blink(BLINK_DELAY.olivka);
    setHasBlinked(true);
  }

  if (!olivka || !simba) {
    throw new Error('Hero expects exactly two cats in cats.ts');
  }

  return (
    <header className={styles.hero}>
      <nav className={styles.nav} aria-label="Sections">
        <ul>
          {cats.map((cat) => (
            <li key={cat.id}>
              <a href={`#${cat.id}`}>{cat.name}</a>
            </li>
          ))}
          <li>
            <a href="#photos">Photos</a>
          </li>
        </ul>
      </nav>

      {/*
       * The title doubles as the labels for the eyes: each name sits in the
       * same grid column as that cat's eyes, and the "&" takes the middle.
       * Screen readers still get one heading, "Olivka & Simba".
       */}
      <div className={styles.stage}>
        <div className={styles.eyes} data-cat={olivka.id}>
          <CatEyes ref={olivkaEyes} cat={olivka.id} />
        </div>
        <div className={styles.eyes} data-cat={simba.id}>
          <CatEyes ref={simbaEyes} cat={simba.id} />
        </div>

        <h1 className={styles.title}>
          <span>{olivka.name}</span> <span className={styles.amp}>&</span> <span>{simba.name}</span>
        </h1>
      </div>

      {/* From the @murmuringcats Instagram bio. */}
      <p className={styles.intro}>Professional snugglers. Maximum affection, minimal boundaries.</p>

      {/* The signature moment. It only ever plays when someone asks for it. */}
      <div className={styles.blink}>
        <motion.button
          type="button"
          className={styles.blinkButton}
          onClick={blinkAtThem}
          whileTap={{ scale: 0.96 }}
        >
          Blink slowly at them
        </motion.button>
        <p className={styles.blinkNote} role="status">
          {hasBlinked && 'They blinked back. To a cat, a slow blink means “I trust you.”'}
        </p>
      </div>
    </header>
  );
}
