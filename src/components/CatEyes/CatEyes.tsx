import { useId } from 'react';
import type { CatId } from '../../data/cats.ts';
import styles from './CatEyes.module.css';

interface EyeShape {
  /** Half-width and half-height of the eye opening. */
  rx: number;
  ry: number;
  /** How far the upper lid comes down, as a share of eye height, at the outer and inner corner. */
  lidOuter: number;
  lidInner: number;
  pupilRx: number;
  pupilRy: number;
}

// Drawn from the photos: Olivka's upper lids sit low and slope toward the
// nose, which is where her unimpressed look comes from. Simba's eyes are
// round and wide open.
const shapes: Record<CatId, EyeShape> = {
  olivka: { rx: 50, ry: 40, lidOuter: 0.2, lidInner: 0.42, pupilRx: 8, pupilRy: 30 },
  simba: { rx: 48, ry: 46, lidOuter: 0.05, lidInner: 0.05, pupilRx: 17, pupilRy: 32 },
};

const EYE_CY = 56;
// Left eye, right eye. The inner corner of each is the side nearer the nose.
const EYE_CX = [62, 198] as const;

export function CatEyes({ cat }: { cat: CatId }) {
  const id = useId();
  const shape = shapes[cat];
  const top = EYE_CY - shape.ry;
  const height = shape.ry * 2;

  return (
    <svg
      className={styles.eyes}
      data-cat={cat}
      viewBox="0 0 260 136"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {EYE_CX.map((cx, index) => (
          <clipPath key={cx} id={`${id}-eye-${index}`}>
            <ellipse cx={cx} cy={EYE_CY} rx={shape.rx} ry={shape.ry} />
          </clipPath>
        ))}
      </defs>

      {EYE_CX.map((cx, index) => {
        const isLeftEye = index === 0;
        const left = cx - shape.rx;
        const right = cx + shape.rx;
        const lidLeftY = top + height * (isLeftEye ? shape.lidOuter : shape.lidInner);
        const lidRightY = top + height * (isLeftEye ? shape.lidInner : shape.lidOuter);

        return (
          // Everything inside is clipped to the eye opening, so the lid can be
          // a plain polygon and the iris outline only shows on the inside.
          <g key={cx} clipPath={`url(#${id}-eye-${index})`}>
            <ellipse className={styles.iris} cx={cx} cy={EYE_CY} rx={shape.rx} ry={shape.ry} />
            <ellipse
              className={styles.pupil}
              cx={cx}
              cy={EYE_CY + 4}
              rx={shape.pupilRx}
              ry={shape.pupilRy}
            />
            <circle className={styles.glint} cx={cx - shape.rx * 0.42} cy={EYE_CY} r={6} />
            <polygon
              className={styles.lid}
              points={`${left},${top} ${right},${top} ${right},${lidRightY} ${left},${lidLeftY}`}
            />
          </g>
        );
      })}

      <path
        className={styles.nose}
        d="M117 110 Q130 103 143 110 Q139 121 130 127 Q121 121 117 110 Z"
      />
    </svg>
  );
}
