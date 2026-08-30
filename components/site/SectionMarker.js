/**
 * The section marker used throughout the site: an eyebrow, a hairline rule
 * (in an intent hue where one applies), and the heading beneath it. Replaces
 * every bare bold heading — SectionHeading.js re-exports this component
 * under its old name so existing call sites keep working unchanged.
 *
 * `number` only belongs on a page whose sections really are a sequence — the
 * programme reference page, where a reader moves through eligibility,
 * documents, process, fees and so on in that order. A discovery page's
 * sections are not a sequence, and numbering them would claim an order that
 * is not real.
 *
 * `hue` tints the rule itself, for the one page type where a section is
 * about a specific intent (the intent hub, an intent-scoped section of a
 * programme page). Everywhere else it is left unset and the rule stays
 * --color-rule, same as always.
 *
 * @param {{
 *   id?: string,
 *   eyebrow: string,
 *   title?: React.ReactNode,
 *   children?: React.ReactNode,
 *   number?: number,
 *   hue?: string,
 *   as?: "h2" | "h3",
 *   trailing?: React.ReactNode,
 *   className?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function SectionMarker({
  id,
  eyebrow,
  title,
  children,
  number,
  hue,
  as: Tag = "h2",
  trailing,
  className = "",
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline gap-3">
        <p className="t-eyebrow">{eyebrow}</p>
        {number ? (
          <p aria-hidden="true" className="font-data text-xs text-label-3">
            {String(number).padStart(2, "0")}
          </p>
        ) : null}
      </div>
      <div
        className="mt-3 border-t pt-4"
        style={{ borderTopColor: hue ?? "var(--color-rule)" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Tag id={id} className="t-section scroll-mt-24 text-label">
            {title ?? children}
          </Tag>
          {trailing}
        </div>
      </div>
    </div>
  );
}
