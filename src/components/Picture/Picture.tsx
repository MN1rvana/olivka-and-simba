'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { Photo } from '../../data/photos.ts';
import { buildSrcSet, largestWidth, photoUrl } from '../../lib/photos.ts';
import styles from './Picture.module.css';

interface PictureProps {
  photo: Photo;
  /** Tells the browser how wide the image will be shown, so it can pick a file from srcset before layout. */
  sizes: string;
  /** Use eager + priority only for an image that is likely in the first viewport. */
  priority?: boolean;
  className?: string | undefined;
  /** Shared-layout id. Two Pictures with the same id animate from one position to the other. */
  layoutId?: string | undefined;
  /** Replaces the manifest's alt text, e.g. when the real one would give away a game answer. */
  alt?: string | undefined;
}

/**
 * One photo: AVIF for browsers that support it, WebP for the rest.
 * width/height reserve the space up front, so nothing shifts while it
 * loads, and the tiny blurred placeholder shows through until it does.
 *
 * The fade-in is only for photos that are still loading once React is
 * running. The page is static HTML first, so a photo can finish loading
 * before React hydrates. Its load event is then missed, and starting
 * every photo invisible would hide it for good. So the starting state is
 * "visible", and a photo is hidden only if React finds it unfinished.
 * The priority photo (in the first screen) never fades, so nothing delays
 * it.
 */
export function Picture({
  photo,
  sizes,
  priority = false,
  className,
  layoutId,
  alt = photo.alt,
}: PictureProps) {
  const [status, setStatus] = useState<'shown' | 'loading' | 'loaded'>('shown');

  return (
    <motion.picture
      // Spread, because with exactOptionalPropertyTypes motion's layoutId
      // accepts a string or no prop at all, but not undefined.
      {...(layoutId ? { layoutId } : {})}
      className={className ? `${styles.picture} ${className}` : styles.picture}
      style={{ backgroundImage: `url(${photo.placeholder})` }}
      data-status={status}
    >
      <source type="image/avif" srcSet={buildSrcSet(photo, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcSet(photo, 'webp')} sizes={sizes} />
      <img
        src={photoUrl(photo, largestWidth(photo), 'webp')}
        width={photo.width}
        height={photo.height}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        ref={(img) => {
          if (img && !priority && !img.complete) setStatus('loading');
        }}
        onLoad={() => setStatus((current) => (current === 'loading' ? 'loaded' : current))}
      />
    </motion.picture>
  );
}
