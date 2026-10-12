import styles from './SkipLink.module.css';

/** First focusable element on the page. Lets keyboard users jump past the hero. */
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a className={styles.skipLink} href={`#${targetId}`}>
      Skip to content
    </a>
  );
}
