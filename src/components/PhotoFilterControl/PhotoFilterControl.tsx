import { motion } from 'motion/react';
import { PHOTO_FILTERS, type PhotoFilter } from '../../lib/gallery.ts';
import styles from './PhotoFilterControl.module.css';

const LABELS: Record<PhotoFilter, string> = {
  all: 'All',
  olivka: 'Olivka',
  simba: 'Simba',
  both: 'Both',
};

interface PhotoFilterControlProps {
  value: PhotoFilter;
  counts: Record<PhotoFilter, number>;
  onChange: (filter: PhotoFilter) => void;
}

/**
 * Native radio buttons, styled as a segmented control. The browser
 * provides the semantics for free: one choice at a time, arrow keys move
 * between options, and screen readers announce "2 of 4". No ARIA needed.
 */
export function PhotoFilterControl({ value, counts, onChange }: PhotoFilterControlProps) {
  return (
    <fieldset className={styles.control}>
      <legend className="visually-hidden">Show photos of</legend>
      {PHOTO_FILTERS.map((filter) => (
        <motion.label key={filter} className={styles.option} whileTap={{ scale: 0.96 }}>
          <input
            type="radio"
            name="photo-filter"
            value={filter}
            checked={value === filter}
            onChange={() => onChange(filter)}
          />
          {LABELS[filter]} <span className={styles.count}>{counts[filter]}</span>
        </motion.label>
      ))}
    </fieldset>
  );
}
