/**
 * A small status or classification label.
 *
 * The intent hues are deliberately never used as text colour. At body size on
 * white they fail WCAG AA, so the hue is carried by a tinted fill and a solid
 * dot while the text stays on --color-label, which is the one value guaranteed
 * to contrast against the surface in both appearances.
 *
 * The same rule applies to success, warning and danger, with an icon instead of
 * a dot. Colour is never the only signal: every badge renders its label word,
 * and the status tones add a shape as well.
 */

/**
 * @typedef {"neutral" | "success" | "warning" | "danger" | "visitor" | "work"
 *   | "study" | "family" | "investor" | "residence"} BadgeTone
 */

/**
 * Each tone resolves to a custom property, never a literal colour.
 *
 * @type {Record<BadgeTone, { hue: string, icon: "check" | "alert" | "cross" | null }>}
 */
const TONES = {
  neutral: { hue: "var(--color-label-2)", icon: null },
  success: { hue: "var(--color-success)", icon: "check" },
  warning: { hue: "var(--color-warning)", icon: "alert" },
  danger: { hue: "var(--color-danger)", icon: "cross" },
  visitor: { hue: "var(--intent-visitor)", icon: null },
  work: { hue: "var(--intent-work)", icon: null },
  study: { hue: "var(--intent-study)", icon: null },
  family: { hue: "var(--intent-family)", icon: null },
  investor: { hue: "var(--intent-investor)", icon: null },
  residence: { hue: "var(--intent-residence)", icon: null },
};

/**
 * @param {{ name: "check" | "alert" | "cross", hue: string }} props
 * @returns {JSX.Element}
 */
function ToneIcon({ name, hue }) {
  const paths = {
    check: <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />,
    alert: (
      <>
        <path d="M8 2.5 14.5 13.5H1.5L8 2.5Z" />
        <path d="M8 6.5v3" />
        <path d="M8 11.6v.4" />
      </>
    ),
    cross: <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" />,
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      style={{ color: hue }}
    >
      {paths[name]}
    </svg>
  );
}

/**
 * @param {{ tone?: BadgeTone, children: React.ReactNode, onInk?: boolean }} props
 * @returns {JSX.Element}
 */
export default function Badge({ tone = "neutral", children, onInk = false }) {
  const { hue, icon } = TONES[tone] ?? TONES.neutral;

  // On a brand-ink ground the label cannot stay on --color-label: black text
  // over a 14% hue tint composited on navy measures 1.33:1. The ink variant
  // flips the text to --color-on-brand and lifts the fill so the badge still
  // reads as a badge.
  const fillPercent = onInk ? 26 : 14;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1 text-xs font-medium [overflow-wrap:anywhere] ${
        onInk ? "text-on-brand" : "text-label"
      }`}
      style={{
        backgroundColor: `color-mix(in srgb, ${hue} ${fillPercent}%, transparent)`,
      }}
    >
      {icon ? (
        <ToneIcon name={icon} hue={hue} />
      ) : (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: hue }}
        />
      )}
      {children}
    </span>
  );
}
