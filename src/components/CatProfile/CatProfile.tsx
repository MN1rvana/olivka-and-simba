import type { Cat } from '../../data/cats.ts';
import { getPhoto } from '../../data/photos.ts';
import { getAgeInYears } from '../../lib/age.ts';
import { formatBirthday, joinAsSentenceList } from '../../lib/format.ts';
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
  /** Injected so the age can be tested against a fixed date. */
  today?: Date;
}

/*
 * One component for both cats. The two sections still look like different
 * characters: CatProfile.module.css gives each cat its own ground color,
 * proportions and photo position, keyed off data-cat.
 */
export function CatProfile({ cat, priority = false, today = new Date() }: CatProfileProps) {
  const headingId = `${cat.id}-heading`;
  const portrait = getPhoto(cat.portraitId);

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
                , born {formatBirthday(cat.birthday)} ({getAgeInYears(cat.birthday, today)})
              </>
            )}
          </p>

          {cat.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <p>
            {cat.name} is {joinAsSentenceList(cat.traits)}.
          </p>

          <div className={styles.lists}>
            <div>
              <h3>Favorite things</h3>
              <ul>
                {cat.favorites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Habits</h3>
              <ul>
                {cat.habits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
