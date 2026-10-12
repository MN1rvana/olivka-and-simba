import { useRef, useState } from 'react';
import { photos } from '../../data/photos.ts';
import { countByFilter, filterPhotos } from '../../lib/gallery.ts';
import { usePhotoFilter } from '../../hooks/usePhotoFilter.ts';
import { Lightbox } from '../Lightbox/Lightbox.tsx';
import { Picture } from '../Picture/Picture.tsx';
import { PhotoFilterControl } from '../PhotoFilterControl/PhotoFilterControl.tsx';
import styles from './Gallery.module.css';

const counts = countByFilter(photos);

export function Gallery() {
  const [filter, setFilter] = usePhotoFilter();
  const visible = filterPhotos(photos, filter);

  const [openId, setOpenId] = useState<string | null>(null);
  // Which thumbnail opened the lightbox, so focus can go back to it on close.
  const openerId = useRef<string | null>(null);
  const thumbnails = useRef(new Map<string, HTMLButtonElement>());

  const openIndex = visible.findIndex((photo) => photo.id === openId);

  function open(id: string) {
    openerId.current = id;
    setOpenId(id);
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
        <PhotoFilterControl value={filter} counts={counts} onChange={setFilter} />
      </div>

      {/* A live region: screen readers hear the new count when the filter changes. */}
      <p className={styles.status} role="status">
        {visible.length === 0
          ? 'No photos here yet.'
          : `${visible.length} ${visible.length === 1 ? 'photo' : 'photos'}`}
      </p>

      <ul className={styles.grid} role="list">
        {visible.map((photo) => {
          const ratio = photo.width / photo.height;

          return (
            <li
              key={photo.id}
              className={styles.item}
              // Grow and basis both proportional to the aspect ratio, so every
              // photo in a row ends up the same height.
              style={{ flexGrow: ratio, flexBasis: `calc(${ratio} * var(--row-height))` }}
            >
              <button
                type="button"
                className={styles.thumb}
                onClick={() => open(photo.id)}
                ref={(node) => {
                  if (node) thumbnails.current.set(photo.id, node);
                  return () => {
                    thumbnails.current.delete(photo.id);
                  };
                }}
              >
                <Picture
                  photo={photo}
                  sizes="(min-width: 60rem) 33vw, (min-width: 30rem) 50vw, 100vw"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <Lightbox
        photos={visible}
        index={openIndex === -1 ? null : openIndex}
        onNavigate={(index) => setOpenId(visible[index]?.id ?? null)}
        onClose={close}
      />
    </section>
  );
}
