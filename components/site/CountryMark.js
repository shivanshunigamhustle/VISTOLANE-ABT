/**
 * The permanent fallback for a destination card with no photograph.
 *
 * The motif is the product's own name: a lane running to a horizon. Not a
 * flag — a slightly wrong flag is worse than none on a site whose whole
 * proposition is accuracy — but each instance is tinted from that country's
 * real flag palette, so the set still reads as distinct countries rather
 * than one generic placeholder repeated five times.
 *
 * Designed to live in production for any country that is never photographed,
 * not scaffolding: there is no "Image pending" text here, only a dev-only
 * console warning fired by the caller.
 *
 * @type {Record<string, { sky: string, lane: string }>}
 */
const PALETTE = {
  canada: { sky: "#D52B1E", lane: "#FFFFFF" },
  australia: { sky: "#00247D", lane: "#FFFFFF" },
  germany: { sky: "#DD0000", lane: "#FFCE00" },
  "united-kingdom": { sky: "#012169", lane: "#C8102E" },
  vietnam: { sky: "#DA251D", lane: "#FFFF00" },
};

const FALLBACK = { sky: "#13274D", lane: "#F5C33B" };

/**
 * @param {{ countrySlug: string, label: string, className?: string }} props
 * @returns {JSX.Element}
 */
export default function CountryMark({ countrySlug, label, className = "" }) {
  const { sky, lane } = PALETTE[countrySlug] ?? FALLBACK;
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
      <rect width="160" height="120" fill="#0B1830" />
      <rect width="160" height="58" fill={`url(#${uid}-sky)`} />
      <rect y="57" width="160" height="1.5" fill={lane} opacity="0.55" />
      <path d="M74 58 H86 L124 120 H36 Z" fill={lane} opacity="0.14" />
      <path d="M78.4 58 H81.6 L86 120 H74 Z" fill={lane} opacity="0.85" />
      <circle cx="80" cy="42" r="9" fill={lane} opacity="0.22" />
    </svg>
  );
}
