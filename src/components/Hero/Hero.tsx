import { cats } from '../../data/cats.ts';
import { CatEyes } from '../CatEyes/CatEyes.tsx';
import styles from './Hero.module.css';

export function Hero() {
  const [olivka, simba] = cats;

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
        </ul>
      </nav>

      {/*
       * The title doubles as the labels for the eyes: each name sits in the
       * same grid column as that cat's eyes, and the "&" takes the middle.
       * Screen readers still get one heading, "Olivka & Simba".
       */}
      <div className={styles.stage}>
        <div className={styles.eyes} data-cat={olivka.id}>
          <CatEyes cat={olivka.id} />
        </div>
        <div className={styles.eyes} data-cat={simba.id}>
          <CatEyes cat={simba.id} />
        </div>

        <h1 className={styles.title}>
          <span>{olivka.name}</span> <span className={styles.amp}>&</span> <span>{simba.name}</span>
        </h1>
      </div>

      {/* From the @murmuringcats Instagram bio. */}
      <p className={styles.intro}>Professional snugglers. Maximum affection, minimal boundaries.</p>
    </header>
  );
}
