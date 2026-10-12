import styles from './App.module.css';

export function App() {
  return (
    <main className={styles.page}>
      <h1>Olivka & Simba</h1>
      <p className={styles.note}>
        A site about my two golden British Shorthairs. I'm building it in public, one step at a
        time. <a href="https://github.com/MN1rvana/olivka-and-simba">The code is on GitHub</a>.
      </p>
    </main>
  );
}
