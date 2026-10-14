import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';
import HomePage from './page.tsx';

/** Runs axe on the whole document and returns one readable line per problem. */
async function axeViolations() {
  const results = await axe.run(document, {
    rules: {
      // jsdom doesn't compute styles or layout, so axe can't measure contrast
      // here. Contrast is checked in docs/design.md and by Lighthouse.
      'color-contrast': { enabled: false },
    },
  });
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(' ')).join(', ')})`,
  );
}

describe('accessibility (axe)', () => {
  it('finds no problems on the page', async () => {
    render(<HomePage />);
    expect(await axeViolations()).toEqual([]);
  });

  it('finds no problems with the lightbox open', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getAllByRole('button', { name: /lying on/i })[0]!);
    expect(await axeViolations()).toEqual([]);
  });

  it('finds no problems after a game guess', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: 'Simba' }));
    expect(await axeViolations()).toEqual([]);
  });
});
