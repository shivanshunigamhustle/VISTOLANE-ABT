/**
 * Marks a value the research did not confirm.
 *
 * Records carry "Verify before publish" markers where a figure could not be
 * checked against an official source. Rendering that sentence as if it were the
 * answer would be worse than saying nothing, so it becomes a muted chip and the
 * reason moves into a tooltip. The gap stays visible instead of hiding inside
 * prose that looks authoritative.
 *
 * Some fields are wholly unverified and some carry confirmed content followed by
 * a caveat. Both are handled: confirmed text is kept and the chip is appended.
 */

import { splitUnverified } from "@/lib/content/unverified";

export { splitUnverified };

/**
 * @param {{ reason?: string | null, onInk?: boolean }} props
 * @returns {JSX.Element}
 */
export default function Unverified({ reason, onInk = false }) {
  // On a brand-ink ground --color-label-2 is a dark grey on navy and measures
  // 1.47:1. The ink variant flips to --color-on-brand over a lifted fill.
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-0.5 align-middle font-ui text-xs font-medium ${
        onInk ? "bg-on-brand/15 text-on-brand" : "bg-fill text-label-2"
      }`}
      title={reason || undefined}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 16 16"
        width="11"
        height="11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <circle cx="8" cy="8" r="6.5" strokeDasharray="2.4 2.2" />
        <path d="M8 10.9v.4" />
        <path d="M6.6 6.3a1.5 1.5 0 0 1 2.9.5c0 1-1.5 1.3-1.5 2.2" />
      </svg>
      Not yet verified
      {reason ? <span className="sr-only">. {reason}</span> : null}
    </span>
  );
}

/**
 * Render a record field, substituting the chip where the value is unverified.
 *
 * @param {{ value: unknown, onInk?: boolean }} props
 * @returns {JSX.Element}
 */
export function FieldValue({ value, onInk = false }) {
  const { text, reason } = splitUnverified(value);

  if (!text) return <Unverified reason={reason} onInk={onInk} />;
  if (!reason) return <>{text}</>;

  return (
    <>
      {text} <Unverified reason={reason} onInk={onInk} />
    </>
  );
}
