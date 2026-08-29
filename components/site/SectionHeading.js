/**
 * The section marker used throughout the site: an eyebrow, a hairline rule, and
 * the heading beneath it.
 *
 * This pair is what replaces a bare bold heading. It does the work a bold
 * heading cannot — it says what kind of thing follows, and the rule gives the
 * page a horizontal structure to read against.
 *
 * @param {{
 *   id?: string,
 *   eyebrow: string,
 *   children: React.ReactNode,
 *   as?: "h2" | "h3",
 *   trailing?: React.ReactNode,
 *   className?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function SectionHeading({
  id,
  eyebrow,
  children,
  as: Tag = "h2",
  trailing,
  className = "",
}) {
  return (
    <div className={className}>
      <p className="t-eyebrow">{eyebrow}</p>
      <div className="mt-3 border-t border-rule pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <Tag id={id} className="t-section scroll-mt-24 text-label">
            {children}
          </Tag>
          {trailing}
        </div>
      </div>
    </div>
  );
}
