/**
 * The general-purpose icon set: one coherent family, 24px optical size,
 * 1.5px stroke, rounded caps and joins, drawn on a single grid.
 *
 * The six intent icons are deliberately NOT redrawn here. IntentIcon.js
 * already carries a tested, two-tone 28px system used across every intent
 * card on the live site (home, country pages, destination cards); redrawing
 * them to this set's 24px single-tone grid would be a visual change to
 * pages that already work, for no functional gain. This set covers every
 * icon this UI pass needs beyond those six, and IconSet re-exports the
 * intent icon under its own name so a caller never has to know which file a
 * given icon actually lives in.
 */

import IntentIcon from "@/components/site/IntentIcon";

/** @type {Record<string, JSX.Element>} */
const SHAPES = {
  document: (
    <>
      <path d="M6.5 3.5h8l4 4v13h-12z" />
      <path d="M14.5 3.5v4h4" />
      <path d="M9.5 12.5h6M9.5 16h4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  money: (
    <>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M2.5 10h2M19.5 10h2M2.5 14h2M19.5 14h2" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 10v9.5h13V10" />
    </>
  ),
  health: (
    <>
      <path d="M12 3.5 20 7v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V7l8-3.5Z" />
      <path d="M12 9v6M9 12h6" />
    </>
  ),
  education: (
    <>
      <path d="M12 5 22 10l-10 5L2 10l10-5Z" />
      <path d="M6 12v4.5c0 1.5 2.7 2.7 6 2.7s6-1.2 6-2.7V12" />
    </>
  ),
  family: (
    <>
      <circle cx="8.5" cy="7.5" r="3" />
      <path d="M2.5 19.5c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
      <circle cx="16.5" cy="9" r="2.2" />
      <path d="M15 14.5c2.9-.5 5.5 1.6 5.5 4.5" />
    </>
  ),
  work: (
    <>
      <rect x="2.5" y="7.5" width="19" height="12" rx="2" />
      <path d="M8.5 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2" />
      <path d="M2.5 12.5h19" />
    </>
  ),
  plane: (
    <>
      <path d="M2.5 13.5 21 6.5c.9-.35 1.7.45 1.35 1.35L15 21l-2-7-7-2 6.5-3.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 20 7v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V7l8-3.5Z" />
      <path d="M8.5 12 11 14.5l4.5-5" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.5 10.8 15.3 16.5 9" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 22 20.5H2Z" />
      <path d="M12 9.5v5M12 17.4v.4" />
    </>
  ),
  source: (
    <>
      <path d="M5.5 3.5h9l4.5 4.5v12.5h-13.5Z" />
      <path d="M14.5 3.5v4.5h4.5" />
      <path d="M8.5 12.5h7M8.5 15.5h4.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5S5 14.7 5 9.5a7 7 0 1 1 14 0c0 5.2-7 12-7 12Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
};

/**
 * @param {{ name: string, size?: number, className?: string }} props
 * @returns {JSX.Element | null}
 */
export default function Icon({ name, size = 24, className = "" }) {
  if (name in INTENT_ALIASES) {
    return (
      <IntentIcon slug={INTENT_ALIASES[name]} hue="currentColor" size={size} />
    );
  }

  const shape = SHAPES[name];
  if (!shape) return null;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {shape}
    </svg>
  );
}

/** Lets a caller ask IconSet for "visitor"..."residence" without knowing they live in IntentIcon. */
const INTENT_ALIASES = {
  visitor: "visitor",
  study: "study",
  investor: "investor",
  residence: "residence",
};
