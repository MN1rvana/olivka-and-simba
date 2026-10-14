import type { Cat } from '../../data/cats.ts';
import { getPhoto } from '../../data/photos.ts';
import { missingContent } from '../../lib/content.ts';
import { formatBirthday, joinAsSentenceList } from '../../lib/format.ts';
import { CatAge } from '../CatAge/CatAge.tsx';
import { Picture } from '../Picture/Picture.tsx';
import styles from './CatProfile.module.css';

// How wide each portrait is shown, so the browser picks the right file from srcset.
const PORTRAIT_SIZES = {
  olivka: '(min-width: 48rem) min(40vw, 30rem), 100vw',
  simba: '(min-width: 48rem) min(50vw, 36rem), 100vw',
} as const;

interface CatProfileProps {
  cat: Cat;
  /** The first section starts inside the first screen, so its photo loads with high priority. */
  priority?: boolean;
}

/*
 * One component for both cats. The two sections still look like different
 * characters: CatProfile.module.css gives each cat its own ground color,
 * proportions and photo position, keyed off data-cat.
 */
export function CatProfile({ cat, priority = false }: CatProfileProps) {
  const headingId = `${cat.id}-heading`;
  const portrait = getPhoto(cat.portraitId);

  // A server component, so in `next dev` this prints in the terminal, not the browser.
  const missing = missingContent(cat);
  if (process.env.NODE_ENV === 'development' && missing.length > 0) {
    console.warn(`TODO(Maryna): ${cat.name} has no ${missing.join(', ')} yet in src/data/cats.ts`);
  }

  return (
    <section id={cat.id} className={styles.profile} data-cat={cat.id} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <Picture
          photo={portrait}
          sizes={PORTRAIT_SIZES[cat.id]}
          priority={priority}
          className={styles.photo}
        />

        <div className={styles.text}>
          <h2 id={headingId} className={styles.name}>
            {cat.name}
          </h2>
          <p className={styles.meta}>
            {cat.coat}
            {cat.birthday && (
              <>
                , born {formatBirthday(cat.birthday)}
                <CatAge birthday={cat.birthday} />
              </>
            )}
          </p>

          {cat.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {/* Every part below is left out until it has content: no placeholders on the live site. */}
          {cat.traits.length > 0 && (
            <p>
              {cat.name} is {joinAsSentenceList(cat.traits)}.
            </p>
          )}

          {(cat.favorites.length > 0 || cat.habits.length > 0) && (
            <div className={styles.lists}>
              {cat.favorites.length > 0 && (
                <div>
                  <h3>Favorite things</h3>
                  <ul>
                    {cat.favorites.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {cat.habits.length > 0 && (
                <div>
                  <h3>Habits</h3>
                  <ul>
                    {cat.habits.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
