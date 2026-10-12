import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        Made by Maryna. The code is{' '}
        <a href="https://github.com/MN1rvana/olivka-and-simba">on GitHub</a>, and the cats are{' '}
        <a href="https://www.instagram.com/murmuringcats/">on Instagram</a>.
      </p>
    </footer>
  );
}
