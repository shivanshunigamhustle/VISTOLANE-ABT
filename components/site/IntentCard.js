"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import IntentIcon from "@/components/site/IntentIcon";

/**
 * One intent.
 *
 * The card is a 7% wash of its own hue over --color-surface, with the label in
 * a darkened (light) or lifted (dark) variant of that hue. Those label values
 * are computed against exactly this ground — see the note in globals.css. The
 * mix base is --color-surface and is not a prop: change it and the labels stop
 * clearing AA.
 *
 * Body copy stays on --color-label. Only the label takes the hue.
 *
 * An intent with nothing behind it is shown quietly and inert rather than
 * hidden — someone looking for a study route needs to know it is not covered
 * yet, not to wonder whether they missed it.
 *
 * @param {{
 *   intent: import("@/lib/content/intents").Intent,
 *   countrySlug?: string,
 *   href?: string,
 *   count: number,
 *   description?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function IntentCard({
  intent,
  countrySlug,
  href,
  count,
  description,
}) {
  const hue = `var(${intent.token})`;
  const labelColour = `var(--intent-${intent.slug}-text)`;
  const empty = count === 0;

  const background = `color-mix(in srgb, ${hue} 7%, var(--color-surface))`;
  const reduceMotion = useReducedMotion();

  const inner = (
    <>
      <motion.span
        className="block w-fit"
        whileHover={reduceMotion || empty ? undefined : { scale: 1.08, rotate: -4 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
      >
        <IntentIcon
          slug={intent.slug}
          hue={empty ? `color-mix(in srgb, ${hue} 55%, transparent)` : hue}
        />
      </motion.span>

      <span className="mt-4 block">
        <span
          className="block font-ui text-[1.0625rem] font-semibold leading-snug"
          style={{ color: labelColour }}
        >
          {intent.label}
        </span>
        {description ? (
          <span className="mt-1.5 block font-ui text-[0.875rem] leading-snug text-label">
            {description}
          </span>
        ) : null}
      </span>

      <span className="mt-4 flex items-center gap-1.5 font-ui text-[0.8125rem] text-label-2">
        {empty ? (
          "Not covered yet"
        ) : (
          <>
            {count} {count === 1 ? "guide" : "guides"}
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 16 16"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
            </svg>
          </>
        )}
      </span>
    </>
  );

  if (empty) {
    return (
      <div
        aria-disabled="true"
        className="elevate-soft flex flex-col rounded-card p-5"
        style={{ background }}
      >
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <Link
        href={href ?? `/destinations/${countrySlug}/${intent.slug}`}
        className="elevate-soft flex flex-col rounded-card p-5 no-underline
          transition-shadow duration-200 motion-reduce:transition-none
          hover:shadow-[0_2px_6px_rgb(0_0_0/0.06),0_12px_28px_rgb(0_0_0/0.08)]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
        style={{ background }}
      >
        {inner}
      </Link>
    </motion.div>
  );
}
