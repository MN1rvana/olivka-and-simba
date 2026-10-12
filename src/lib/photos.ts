import type { Photo } from '../data/photos.ts';

export type ImageFormat = 'avif' | 'webp';

/** URL of one generated file. BASE_URL is "/olivka-and-simba/" in production. */
export function photoUrl(photo: Photo, width: number, format: ImageFormat): string {
  return `${import.meta.env.BASE_URL}photos/${photo.id}-${width}.${format}`;
}

/** "…-480.avif 480w, …-960.avif 960w". The browser picks one using `sizes` and the screen density. */
export function buildSrcSet(photo: Photo, format: ImageFormat): string {
  return photo.widths.map((width) => `${photoUrl(photo, width, format)} ${width}w`).join(', ');
}

export function largestWidth(photo: Photo): number {
  return photo.widths[photo.widths.length - 1] ?? photo.width;
}
