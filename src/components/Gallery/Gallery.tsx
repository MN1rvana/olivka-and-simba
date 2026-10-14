'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { photos } from '../../data/photos.ts';
import { countByFilter, filterPhotos, type PhotoFilter } from '../../lib/gallery.ts';
import { usePhotoFilter } from '../../hooks/usePhotoFilter.ts';
import { Lightbox } from '../Lightbox/Lightbox.tsx';
import { Picture } from '../Picture/Picture.tsx';
import { PhotoFilterControl } from '../PhotoFilterControl/PhotoFilterControl.tsx';
import styles from './Gallery.module.css';

const counts = countByFilter(photos);

const layoutIdFor = (photoId: string) => `photo-${photoId}`;

const describeCount = (count: number) =>
  count === 0 ? 'No photos here yet.' : `${count} ${count === 1 ? 'photo' : 'photos'}`;

const REFLOW = { type: 'spring', duration: 0.45, bounce: 0.1 } as const;
const INSTANT = { duration: 0 } as const;

export function Gallery() {
  const [filter, setFilter] = usePhotoFilter();
  const visible = filterPhotos(photos, filter);

  // A shared link (?cat=simba) is applied straight after the static HTML
  // hydrates. That isn't something the visitor did, so it shouldn't
  // animate or be announced. Both start only after a real filter change.
  const [hasChangedFilter, setHasChangedFilter] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  function changeFilter(next: PhotoFilter) {
    setFilter(next);
    setHasChangedFilter(true);
    setAnnouncement(describeCount(filterPhotos(photos, next).length));
  }

  const [openId, setOpenId] = useState<string | null>(null);
  // The lightbox only flies out of the thumbnail that opened it. After the
  // first ←/→ it stops sharing layout, so a later photo doesn't fly in
  // from somewhere else on the page.
  const [hasNavigated, setHasNavigated] = useState(false);
  // Which thumbnail opened the lightbox, so focus can go back to it on close.
  const openerId = useRef<string | null>(null);
  const thumbnails = useRef(new Map<string, HTMLButtonElement>());

  const openIndex = visible.findIndex((photo) => photo.id === openId);

  function open(id: string) {
    openerId.current = id;
    setHasNavigated(false);
    setOpenId(id);
  }

  function navigate(index: number) {
    setHasNavigated(true);
    setOpenId(visible[index]?.id ?? null);
  }

  function close() {
    setOpenId(null);
    if (openerId.current) {
      thumbnails.current.get(openerId.current)?.focus();
    }
  }

  return (
    <section id="photos" className={styles.gallery} aria-labelledby="photos-heading">
      <div className={styles.header}>
        <h2 id="photos-heading">Photos</h2>
        <PhotoFilterControl value={filter} counts={counts} onChange={changeFilter} />
      </div>

      <p className={styles.status}>{describeCount(visible.length)}</p>
      {/* A live region that only changes when the visitor picks a filter, so
          screen readers hear the new count then, and not on page load. */}
      <p className="visually-hidden" role="status">
        {announcement}
      </p>

      <ul className={styles.grid} role="list">
        {/*
         * When the filter changes, photos that stay slide to their new spots
         * (layout), photos that leave fade out and are taken out of the flow
         * at once (popLayout), and new ones fade in. initial={false}: nothing
         * animates on first load.
         */}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((photo) => {
            const ratio = photo.width / photo.height;

            return (
              <motion.li
                key={photo.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={hasChangedFilter ? REFLOW : INSTANT}
                className={styles.item}
                // Grow and basis both proportional to the aspect ratio, so every
                // photo in a row ends up the same height.
                style={{ flexGrow: ratio, flexBasis: `calc(${ratio} * var(--row-height))` }}
              >
                <motion.button
                  type="button"
                  className={styles.thumb}
                  onClick={() => open(photo.id)}
                  whileTap={{ scale: 0.97 }}
                  ref={(node) => {
                    if (node) thumbnails.current.set(photo.id, node);
                    return () => {
                      thumbnails.current.delete(photo.id);
                    };
                  }}
                >
                  <Picture
                    photo={photo}
                    sizes="(min-width: 60rem) 25vw, 50vw"
                    layoutId={layoutIdFor(photo.id)}
                  />
                </motion.button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <Lightbox
        photos={visible}
        index={openIndex === -1 ? null : openIndex}
        sharedLayoutId={openId && !hasNavigated ? layoutIdFor(openId) : undefined}
        onNavigate={navigate}
        onClose={close}
      />
    </section>
  );
}
