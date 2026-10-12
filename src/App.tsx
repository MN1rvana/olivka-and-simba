import { CatProfile } from './components/CatProfile/CatProfile.tsx';
import { Hero } from './components/Hero/Hero.tsx';
import { SiteFooter } from './components/SiteFooter/SiteFooter.tsx';
import { SkipLink } from './components/SkipLink/SkipLink.tsx';
import { cats } from './data/cats.ts';
import styles from './App.module.css';

const MAIN_ID = 'main';

export function App() {
  return (
    <>
      <SkipLink targetId={MAIN_ID} />
      <Hero />
      {/* tabIndex -1 lets the skip link move focus here, not just scroll. */}
      <main id={MAIN_ID} tabIndex={-1} className={styles.main}>
        {cats.map((cat) => (
          <CatProfile key={cat.id} cat={cat} />
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
