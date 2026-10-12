import { MotionConfig } from 'motion/react';
import { CatProfile } from './components/CatProfile/CatProfile.tsx';
import { Gallery } from './components/Gallery/Gallery.tsx';
import { GuessGame } from './components/GuessGame/GuessGame.tsx';
import { Hero } from './components/Hero/Hero.tsx';
import { SiteFooter } from './components/SiteFooter/SiteFooter.tsx';
import { SkipLink } from './components/SkipLink/SkipLink.tsx';
import { cats } from './data/cats.ts';
import styles from './App.module.css';

const MAIN_ID = 'main';

export function App() {
  return (
    // reducedMotion="user": when the OS asks for reduced motion, motion skips
    // transform and layout animations everywhere and keeps opacity fades.
    <MotionConfig reducedMotion="user">
      <SkipLink targetId={MAIN_ID} />
      <Hero />
      {/* tabIndex -1 lets the skip link move focus here, not just scroll. */}
      <main id={MAIN_ID} tabIndex={-1} className={styles.main}>
        {cats.map((cat, index) => (
          <CatProfile key={cat.id} cat={cat} priority={index === 0} />
        ))}
        <Gallery />
        <GuessGame />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}
