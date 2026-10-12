import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuessGame } from './GuessGame.tsx';

const BEST_KEY = 'olivka-and-simba:best-streak';
const score = () => screen.getByText(/^Streak/);

describe('GuessGame', () => {
  beforeEach(() => {
    // Math.random() = 0 picks the first playable photo, which is Olivka's.
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('hides the answer in the alt text until a guess is made', async () => {
    const user = userEvent.setup();
    render(<GuessGame />);

    expect(screen.getByRole('img')).toHaveAccessibleName(/which one is it/i);
    await user.click(screen.getByRole('button', { name: 'Olivka' }));
    expect(screen.getByRole('img')).toHaveAccessibleName(/^Olivka/);
  });

  it('scores a right guess, saves the best, and moves focus to Next photo', async () => {
    const user = userEvent.setup();
    render(<GuessGame />);

    await user.click(screen.getByRole('button', { name: 'Olivka' }));

    expect(screen.getByRole('status')).toHaveTextContent("Yes, that's Olivka.");
    expect(score()).toHaveTextContent('Streak 1 · Best 1');
    expect(screen.getByRole('button', { name: 'Next photo' })).toHaveFocus();
    expect(localStorage.getItem(BEST_KEY)).toBe('1');
  });

  it('resets the streak on a wrong guess but keeps the saved best', async () => {
    localStorage.setItem(BEST_KEY, '5');
    const user = userEvent.setup();
    render(<GuessGame />);
    expect(score()).toHaveTextContent('Streak 0 · Best 5');

    await user.click(screen.getByRole('button', { name: 'Simba' }));

    expect(screen.getByRole('status')).toHaveTextContent("No, that's Olivka.");
    expect(score()).toHaveTextContent('Streak 0 · Best 5');
  });

  it('can be played with the keyboard alone', async () => {
    const user = userEvent.setup();
    render(<GuessGame />);

    screen.getByRole('button', { name: 'Olivka' }).focus();
    await user.keyboard('{Enter}'); // guess Olivka: right
    await user.keyboard('{Enter}'); // Next photo: never the same one twice, so Simba's

    expect(screen.getByRole('button', { name: 'Olivka' })).toHaveFocus();
    await user.tab();
    await user.keyboard(' '); // guess Simba: right

    expect(screen.getByRole('status')).toHaveTextContent("Yes, that's Simba.");
    expect(score()).toHaveTextContent('Streak 2 · Best 2');
  });
});
