'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * MotionConfig uses React context, which only exists in client components.
 * This thin wrapper lets the server-rendered page use it around everything.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user": when the OS asks for reduced motion, motion skips
    // transform and layout animations everywhere and keeps opacity fades.
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  );
}
