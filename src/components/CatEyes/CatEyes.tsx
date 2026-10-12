import { useId, useImperativeHandle, type Ref } from 'react';
import { useAnimate, useReducedMotion } from 'motion/react';
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

const BLINK_LID = '[data-blink-lid]';

export interface CatEyesHandle {
  /** Slowly close and reopen both eyes, starting after `delay` seconds. */
  blink: (delay: number) => void;
}

interface CatEyesProps {
  cat: CatId;
  ref?: Ref<CatEyesHandle>;
}

export function CatEyes({ cat, ref }: CatEyesProps) {
  const id = useId();
  const [scope, animate] = useAnimate<SVGSVGElement>();
  const reduceMotion = useReducedMotion();
  const shape = shapes[cat];
  const top = EYE_CY - shape.ry;
  const height = shape.ry * 2;
  // How far the blink lid travels. It stops just short of the bottom, so a
  // sliver of iris stays visible under the lash line, the way a cat's slow
  // blink looks at its lowest point.
  const closed = height - shape.ry * 0.35;

  // The Hero calls blink() from its button's click handler. That's an
  // imperative handle rather than a prop the eyes watch in an effect, so
  // the animation starts from the event that caused it.
  useImperativeHandle(
    ref,
    () => ({
      blink(delay) {
        if (reduceMotion) {
          // No movement: the closed eye fades in, holds, and fades out.
          void (async () => {
            await animate(BLINK_LID, { y: closed, opacity: 0 }, { duration: 0, delay });
            await animate(
              BLINK_LID,
              { opacity: [0, 1, 1, 0] },
              { duration: 1.2, times: [0, 0.2, 0.8, 1] },
            );
            await animate(BLINK_LID, { y: 0, opacity: 1 }, { duration: 0 });
          })();
          return;
        }

        // A slow blink: lids drift down, rest closed for a moment, then lift
        // a little slower than they fell.
        void animate(
          BLINK_LID,
          { y: [0, closed, closed, 0] },
          { duration: 1.8, times: [0, 0.35, 0.6, 1], ease: 'easeInOut', delay },
        );
      },
    }),
    [animate, closed, reduceMotion],
  );

  return (
    <svg
      ref={scope}
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

        // The blink lid rests above the eye. Its lower edge curves down like
        // a real eyelid, and its deepest point just touches the top of the eye.
        const dip = shape.ry * 0.45;
        const lidLeft = left - 4;
        const lidRight = right + 4;
        const edge = `M${lidLeft},${top - dip} Q${cx},${top + dip} ${lidRight},${top - dip}`;
        const lidFill = `M${lidLeft},${top - height - dip} H${lidRight} V${top - dip} Q${cx},${top + dip} ${lidLeft},${top - dip} Z`;

        return (
          // Everything inside is clipped to the eye opening, so the lids can be
          // plain shapes and the iris outline only shows on the inside.
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
            <g data-blink-lid="">
              <path className={styles.lid} d={lidFill} />
              <path className={styles.lash} d={edge} />
            </g>
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
