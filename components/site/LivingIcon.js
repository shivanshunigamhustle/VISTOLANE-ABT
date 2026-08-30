/**
 * Icons for the "Living there" section on the country page.
 *
 * Same geometry system as IntentIcon: 28×28 box, 1.5 stroke, round caps and
 * joins, two-tone (a full-strength primary form and a secondary form at 45%
 * of the same hue). Kept as a separate small set rather than added to
 * IntentIcon, which is documented as specifically the six intents and
 * should not accumulate unrelated keys.
 */

/** @type {Record<string, JSX.Element>} */
const SHAPES = {
  // Cost of living — a coin stack.
  cost: (
    <>
      <ellipse cx="14" cy="8" rx="8" ry="3" data-tone="primary" />
      <path d="M6 8v12c0 1.7 3.6 3 8 3s8-1.3 8-3V8" data-tone="secondary" />
      <path d="M6 13.3c0 1.7 3.6 3 8 3s8-1.3 8-3" data-tone="secondary" />
      <path d="M6 18.3c0 1.7 3.6 3 8 3s8-1.3 8-3" data-tone="secondary" />
    </>
  ),
  // Healthcare — a cross in a shield.
  healthcare: (
    <>
      <path
        d="M14 3.5 23 7v7c0 6-3.9 9.7-9 12-5.1-2.3-9-6-9-12V7l9-3.5Z"
        data-tone="primary"
      />
      <path d="M14 11v6M11 14h6" data-tone="secondary" />
    </>
  ),
  // Schooling — an open book.
  schooling: (
    <>
      <path
        d="M14 8.5c-2.2-1.6-5.4-2-8-1.5v13.5c2.6-.5 5.8-.1 8 1.5"
        data-tone="primary"
      />
      <path
        d="M14 8.5c2.2-1.6 5.4-2 8-1.5v13.5c-2.6-.5-5.8-.1-8 1.5"
        data-tone="primary"
      />
      <path d="M14 8.5v13.5" data-tone="secondary" />
    </>
  ),
  // Bringing family — two figures, the same motif as the Family intent icon.
  family: (
    <>
      <circle cx="10.5" cy="9" r="3.5" data-tone="primary" />
      <path d="M3.5 22.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" data-tone="primary" />
      <circle cx="19.5" cy="11" r="2.5" data-tone="secondary" />
      <path d="M18 17.2c3.4-.6 6.5 1.8 6.5 5.3" data-tone="secondary" />
    </>
  ),
};

/**
 * @param {{ name: "cost" | "healthcare" | "schooling" | "family", size?: number }} props
 * @returns {JSX.Element | null}
 */
export default function LivingIcon({ name, size = 24 }) {
  const shape = SHAPES[name];
  if (!shape) return null;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 28 28"
      width={size}
      height={size}
      fill="none"
      stroke="var(--color-tint)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 [&_[data-tone=secondary]]:opacity-45"
    >
      {shape}
    </svg>
  );
}
