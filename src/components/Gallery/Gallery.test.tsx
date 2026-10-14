import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { photos } from '../../data/photos.ts';
import { filterPhotos } from '../../lib/gallery.ts';
import { Gallery } from './Gallery.tsx';

// Expected numbers come from the manifest, so adding photos never breaks these tests.
const total = photos.length;
const countOf = (cat: 'olivka' | 'simba') => filterPhotos(photos, cat).length;
const photosText = (count: number) => `${count} ${count === 1 ? 'photo' : 'photos'}`;

const thumbnails = () => within(screen.getByRole('list')).getAllByRole('button');

describe('Gallery filter', () => {
  it('shows only the chosen cat and puts the filter in the URL', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    expect(thumbnails()).toHaveLength(total);

    await user.click(screen.getByRole('radio', { name: /simba/i }));

    expect(window.location.search).toBe('?cat=simba');
    expect(screen.getByRole('status')).toHaveTextContent(photosText(countOf('simba')));
    expect(thumbnails()).toHaveLength(countOf('simba'));
    for (const thumbnail of thumbnails()) {
      expect(thumbnail).toHaveAccessibleName(/simba/i);
    }
  });

  it('starts from the filter in a shared link, quietly', () => {
    window.history.replaceState(null, '', '/?cat=olivka');
    render(<Gallery />);

    expect(screen.getByRole('radio', { name: /olivka/i })).toBeChecked();
    expect(thumbnails()).toHaveLength(countOf('olivka'));
    expect(screen.getByText(photosText(countOf('olivka')))).toBeInTheDocument();
    // Nobody changed anything yet, so there's nothing to announce.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('moves between filters with arrow keys, like any radio group', async () => {
    const user = userEvent.setup();
    render(<Gallery />);

    await user.click(screen.getByRole('radio', { name: /all/i }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('radio', { name: /olivka/i })).toBeChecked();
    expect(window.location.search).toBe('?cat=olivka');
  });

  it('is a single tab stop: Tab goes into the group and straight out again', async () => {
    const user = userEvent.setup();
    render(<Gallery />);

    await user.tab();
    expect(screen.getByRole('radio', { name: /all/i })).toHaveFocus();

    await user.tab();
    expect(thumbnails()[0]).toHaveFocus();
  });

  it('says so when a filter has no photos', async () => {
    const user = userEvent.setup();
    render(<Gallery />);

    await user.click(screen.getByRole('radio', { name: /both/i }));

    expect(screen.getByRole('status')).toHaveTextContent('No photos here yet.');
  });
});

describe('Lightbox keyboard navigation', () => {
  it('opens on Enter, moves with arrow keys, and gives focus back on Escape', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    const [first] = thumbnails();

    first!.focus();
    await user.keyboard('{Enter}');

    const dialog = screen.getByRole('dialog', { name: 'Photo viewer' });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(within(dialog).getByText(`1 of ${total}`)).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByText(`2 of ${total}`)).toBeInTheDocument();
    expect(within(dialog).getByText(new RegExp(`^Photo 2 of ${total}: `))).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(within(dialog).getByText(`1 of ${total}`)).toBeInTheDocument();

    // From the first photo, ← wraps round to the last.
    await user.keyboard('{ArrowLeft}');
    expect(within(dialog).getByText(`${total} of ${total}`)).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(dialog).not.toHaveAttribute('open');
    // Back on the thumbnail that opened it, even though a different photo was showing.
    expect(first).toHaveFocus();
  });

  it('only moves through the photos the filter shows', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/?cat=simba');
    render(<Gallery />);
    const simbaCount = countOf('simba');

    await user.click(thumbnails()[0]!);
    const dialog = screen.getByRole('dialog', { name: 'Photo viewer' });
    expect(within(dialog).getByText(`1 of ${simbaCount}`)).toBeInTheDocument();

    // Step through every photo: each one is Simba's.
    for (let shown = 1; shown <= simbaCount; shown += 1) {
      expect(within(dialog).getByRole('img')).toHaveAccessibleName(/simba/i);
      await user.keyboard('{ArrowRight}');
    }
    expect(within(dialog).getByText(`1 of ${simbaCount}`)).toBeInTheDocument();
  });

  it('closes with the Close button', async () => {
    const user = userEvent.setup();
    render(<Gallery />);

    await user.click(thumbnails()[1]!);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
    expect(thumbnails()[1]).toHaveFocus();
  });
});
