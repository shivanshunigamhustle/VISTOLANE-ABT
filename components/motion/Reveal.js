"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Fast scroll-triggered entrance for a section. Fires once, the moment a
 * piece of the element enters the viewport, so long pages do not feel inert
 * while scrolling past them.
 *
 * Kept snappy on purpose — 0.32s, a short 12px travel — because a slow fade
 * on every section reads as sluggish rather than considered. Respects
 * prefers-reduced-motion by skipping the transform and cutting straight to
 * the resting state, matching the motion-reduce convention already used
 * across the CSS in this codebase.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   as?: keyof JSX.IntrinsicElements,
 *   delay?: number,
 *   y?: number,
 * }} props
 */
export default function Reveal({
  children,
  className = "",
  as = "div",
  delay = 0,
  y = 14,
  ...rest
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
