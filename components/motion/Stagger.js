"use client";

import { motion, useReducedMotion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Wraps a grid or list so its children reveal in a fast, staggered cascade
 * the moment the group scrolls into view, instead of every card appearing at
 * once. Pairs with StaggerItem below, which each direct child should use in
 * place of its own wrapper element.
 *
 * @param {{ children: React.ReactNode, className?: string, as?: keyof JSX.IntrinsicElements }} props
 */
export function StaggerGroup({ children, className = "", as = "div" }) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={reduceMotion ? undefined : container}
    >
      {children}
    </MotionTag>
  );
}

/**
 * @param {{ children: React.ReactNode, className?: string, as?: keyof JSX.IntrinsicElements }} props
 */
export function StaggerItem({ children, className = "", as = "div" }) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag className={className} variants={reduceMotion ? undefined : item}>
      {children}
    </MotionTag>
  );
}
