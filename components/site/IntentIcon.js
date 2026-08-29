/**
 * The six intent icons, drawn as one set.
 *
 * A single geometry system: 28×28 box, 1.5 stroke, round caps and joins, 2px
 * corner radius on every rectangle, and every shape sitting inside the same
 * 4px optical margin. They are two-tone — a full-strength primary form and a
 * secondary form at 45% of the same hue — so the icon reads at a glance without
 * introducing a second colour.
 *
 * Drawn here rather than pulled from a library so the weight, the corner radius
 * and the optical size are identical across all six. Keyed by intent slug; the
 * icon map deliberately lives in this component and not in
 * lib/content/intents.js, which is a fixed contract with the application and
 * should not accumulate presentation keys.
 */

/** @type {Record<string, JSX.Element>} */
const SHAPES = {
  // Visit or Travel — a boarding pass with a torn stub.
  visitor: (
    <>
      <rect x="3" y="8" width="22" height="13" rx="2" data-tone="primary" />
      <path d="M17.5 8v13" strokeDasharray="2 2.2" data-tone="secondary" />
      <path d="M6.5 12.5h7M6.5 16.5h4" data-tone="secondary" />
    </>
  ),
  // Work Abroad — a briefcase.
  work: (
    <>
      <rect x="3" y="9" width="22" height="14" rx="2" data-tone="primary" />
      <path
        d="M10 9V6.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 18 6.5V9"
        data-tone="primary"
      />
      <path d="M3 14.5h22" data-tone="secondary" />
    </>
  ),
  // Study Abroad — a mortarboard.
  study: (
    <>
      <path d="M14 5 25.5 10.5 14 16 2.5 10.5 14 5Z" data-tone="primary" />
      <path d="M7 13v5.5c0 1.7 3.1 3 7 3s7-1.3 7-3V13" data-tone="secondary" />
    </>
  ),
  // Join Family — two figures.
  family: (
    <>
      <circle cx="10.5" cy="9" r="3.5" data-tone="primary" />
      <path d="M3.5 22.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" data-tone="primary" />
      <circle cx="19.5" cy="11" r="2.5" data-tone="secondary" />
      <path d="M18 17.2c3.4-.6 6.5 1.8 6.5 5.3" data-tone="secondary" />
    </>
  ),
  // Invest & Start Up — a rising column chart.
  investor: (
    <>
      <path d="M3.5 23.5h21" data-tone="primary" />
      <rect
        x="5.5"
        y="15"
        width="4.5"
        height="6"
        rx="1.5"
        data-tone="secondary"
      />
      <rect
        x="11.75"
        y="11"
        width="4.5"
        height="10"
        rx="1.5"
        data-tone="secondary"
      />
      <rect x="18" y="6" width="4.5" height="15" rx="1.5" data-tone="primary" />
    </>
  ),
  // Settle & Citizenship — a house with a key.
  residence: (
    <>
      <path d="M4 12.5 14 4.5l10 8" data-tone="primary" />
      <path d="M6.5 14.5v9h15v-9" data-tone="primary" />
      <circle cx="14" cy="17.5" r="2" data-tone="secondary" />
      <path d="M14 19.5v3" data-tone="secondary" />
    </>
  ),
};

/**
 * @param {{ slug: string, hue: string, size?: number }} props
 * @returns {JSX.Element | null}
 */
export default function IntentIcon({ slug, hue, size = 28 }) {
  const shape = SHAPES[slug];
  if (!shape) return null;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill="none"
      stroke={hue}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 [&_[data-tone=secondary]]:opacity-45"
    >
      {shape}
    </svg>
  );
}
