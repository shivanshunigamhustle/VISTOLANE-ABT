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

const MARKER = "Verify before publish";

/**
 * Split a field into the part that was confirmed and the reason it was not.
 *
 * @param {unknown} value
 * @returns {{ text: string | null, reason: string | null }}
 */
export function splitUnverified(value) {
  if (typeof value !== "string") {
    return {
      text: value === null || value === undefined ? null : String(value),
      reason: null,
    };
  }

  const index = value.indexOf(MARKER);
  if (index === -1) return { text: value, reason: null };

  const text = value
    .slice(0, index)
    .trim()
    .replace(/[—–-]\s*$/u, "")
    .trim();
  const reason = value
    .slice(index + MARKER.length)
    .trim()
    .replace(/^[—–-]\s*/u, "")
    .trim();

  return { text: text || null, reason: reason || null };
}

/**
 * @param {{ reason?: string | null }} props
 * @returns {JSX.Element}
 */
export default function Unverified({ reason }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-fill px-2 py-0.5 align-middle font-ui text-xs font-medium text-label-2"
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
 * @param {{ value: unknown }} props
 * @returns {JSX.Element}
 */
export function FieldValue({ value }) {
  const { text, reason } = splitUnverified(value);

  if (!text) return <Unverified reason={reason} />;
  if (!reason) return <>{text}</>;

  return (
    <>
      {text} <Unverified reason={reason} />
    </>
  );
}
