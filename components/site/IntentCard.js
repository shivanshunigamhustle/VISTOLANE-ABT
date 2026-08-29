import Link from "next/link";

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
 * The hover lift is .lift-card from the motion system (styles/globals.css) —
 * a hover-only transform and shadow, never anything that fires on its own.
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

  const inner = (
    <>
      <IntentIcon
        slug={intent.slug}
        hue={empty ? `color-mix(in srgb, ${hue} 55%, transparent)` : hue}
      />

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
    <Link
      href={href ?? `/destinations/${countrySlug}/${intent.slug}`}
      className="lift-card elevate-soft flex flex-col rounded-card p-5 no-underline
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
      style={{ background }}
    >
      {inner}
    </Link>
  );
}
