import { CatProfile } from '../components/CatProfile/CatProfile.tsx';
import { Gallery } from '../components/Gallery/Gallery.tsx';
import { GuessGame } from '../components/GuessGame/GuessGame.tsx';
import { Hero } from '../components/Hero/Hero.tsx';
import { MotionProvider } from '../components/MotionProvider/MotionProvider.tsx';
import { SiteFooter } from '../components/SiteFooter/SiteFooter.tsx';
import { SkipLink } from '../components/SkipLink/SkipLink.tsx';
import { cats } from '../data/cats.ts';
import styles from './page.module.css';

const MAIN_ID = 'main';

/*
 * A server component: at build time it renders to static HTML, so the cats'
 * sections and photos are in the page before any JavaScript runs. Only the
 * parts that react to clicks (Hero, Gallery, GuessGame, Picture) are client
 * components, and those hydrate in the browser.
 */
export default function HomePage() {
  return (
    <MotionProvider>
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
    </MotionProvider>
  );
}
