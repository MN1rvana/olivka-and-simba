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
}

/**
 * One photo: AVIF for browsers that support it, WebP for the rest.
 * width/height reserve the space up front, so nothing shifts while it
 * loads. Until then the tiny placeholder shows through, and the real image
 * fades in over it.
 */
export function Picture({ photo, sizes, priority = false, className, layoutId }: PictureProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.picture
      // Spread, because with exactOptionalPropertyTypes motion's layoutId
      // accepts a string or no prop at all, but not undefined.
      {...(layoutId ? { layoutId } : {})}
      className={className ? `${styles.picture} ${className}` : styles.picture}
      style={{ backgroundImage: `url(${photo.placeholder})` }}
      data-loaded={loaded}
    >
      <source type="image/avif" srcSet={buildSrcSet(photo, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcSet(photo, 'webp')} sizes={sizes} />
      <img
        src={photoUrl(photo, largestWidth(photo), 'webp')}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </motion.picture>
  );
}
