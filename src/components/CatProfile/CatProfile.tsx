import type { Cat } from '../../data/cats.ts';
import { getAgeInYears } from '../../lib/age.ts';
import { formatBirthday, joinAsSentenceList } from '../../lib/format.ts';
import styles from './CatProfile.module.css';

interface CatProfileProps {
  cat: Cat;
  /** Injected so the age can be tested against a fixed date. */
  today?: Date;
}

/*
 * One component for both cats. The two sections still look like different
 * characters: CatProfile.module.css gives each cat its own ground color,
 * proportions and photo position, keyed off data-cat.
 */
export function CatProfile({ cat, today = new Date() }: CatProfileProps) {
  const headingId = `${cat.id}-heading`;

  return (
    <section id={cat.id} className={styles.profile} data-cat={cat.id} aria-labelledby={headingId}>
      <div className={styles.inner}>
        {/* Holds the photo's space until the image pipeline lands in Phase 3. */}
        <div className={styles.photo} aria-hidden="true" />

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
