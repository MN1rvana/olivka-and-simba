import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Gallery } from '../components/Gallery/Gallery.tsx';
import { GuessGame } from '../components/GuessGame/GuessGame.tsx';
import HomePage from './page.tsx';

/**
 * Does what `next build` + the browser do: render to static HTML first,
 * then hydrate that HTML. Returns the container and every hydration
 * problem React reported.
 */
async function buildThenHydrate(ui: React.ReactElement) {
  const container = document.createElement('div');
  container.innerHTML = renderToString(ui);
  document.body.append(container);
  const problems: unknown[] = [];
  vi.spyOn(console, 'error').mockImplementation((...args) => problems.push(args));
  // The async form of act() also waits for the work hydration schedules
  // afterwards (effects, the re-render with the browser's URL). Returning a
  // promise is what selects that form.
  await act(() => {
    hydrateRoot(container, ui, { onRecoverableError: (error) => problems.push(error) });
    return Promise.resolve();
  });
  return { container, problems };
}

describe('static HTML and hydration', () => {
  it('builds the gallery with every photo, then applies ?cat= without a mismatch', async () => {
    window.history.replaceState(null, '', '/?cat=simba');

    const html = renderToString(<Gallery />);
    expect(html.match(/<li/g)).toHaveLength(2);

    const { container, problems } = await buildThenHydrate(<Gallery />);
    expect(problems).toEqual([]);
    expect(container.querySelectorAll('li')).toHaveLength(1);
  });

  it('builds the game without a photo, then starts it in the browser without a mismatch', async () => {
    const html = renderToString(<GuessGame />);
    expect(html).not.toContain('<img');

    const { container, problems } = await buildThenHydrate(<GuessGame />);
    expect(problems).toEqual([]);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('hydrates the whole page without problems', async () => {
    const { problems } = await buildThenHydrate(<HomePage />);
    expect(problems).toEqual([]);
  });
});
