/**
 * The permanent fallback for a destination card with no photograph.
 *
 * The motif is the product's own name: a lane running to a horizon. Not a
 * flag — a slightly wrong flag is worse than none on a site whose whole
 * proposition is accuracy — but each instance is tinted from that country's
 * real flag palette, so the set still reads as distinct countries rather
 * than one generic placeholder repeated five times.
 *
 * The palette lives in styles/tokens.css as --flag-{country}-sky/lane, not as
 * literal hex here: every colour in this codebase has exactly one home, and
 * a national flag colour is still a colour. It just does not shift with the
 * six intent hues, so it gets its own token namespace rather than borrowing
 * --intent-* or --color-*.
 *
 * Designed to live in production for any country that is never photographed,
 * not scaffolding: there is no "Image pending" text here, only a dev-only
 * console warning fired by the caller.
 */

/** Country slugs with a defined flag palette in tokens.css. */
const KNOWN = new Set([
  "canada",
  "australia",
  "germany",
  "united-kingdom",
  "vietnam",
]);

/**
 * @param {{ countrySlug: string, label: string, className?: string }} props
 * @returns {JSX.Element}
 */
export default function CountryMark({ countrySlug, label, className = "" }) {
  const key = KNOWN.has(countrySlug) ? countrySlug : "fallback";
  const sky = `var(--flag-${key}-sky)`;
  const lane = `var(--flag-${key}-lane)`;
  // Ids are per-instance so two marks on one page (a card grid) never share a
  // gradient or clip path.
  const uid = `mark-${countrySlug}`;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 160 120"
      preserveAspectRatio="xMidYMid slice"
      className={`size-full ${className}`}
    >
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} stopOpacity="0.95" />
          <stop offset="1" stopColor={sky} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="var(--color-brand-ink)" />
      <rect width="160" height="58" fill={`url(#${uid}-sky)`} />
      <rect y="57" width="160" height="1.5" fill={lane} opacity="0.55" />
      <path d="M74 58 H86 L124 120 H36 Z" fill={lane} opacity="0.14" />
      <path d="M78.4 58 H81.6 L86 120 H74 Z" fill={lane} opacity="0.85" />
      <circle cx="80" cy="42" r="9" fill={lane} opacity="0.22" />
    </svg>
  );
}
