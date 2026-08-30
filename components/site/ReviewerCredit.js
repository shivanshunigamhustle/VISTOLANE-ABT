/**
 * The reviewer credit, shared by the country and programme pages.
 *
 * The strongest trust element either page has, so it is built as a real
 * block rather than a grey line of text: an avatar slot (there is no photo
 * asset yet, so it falls back to initials on brand-ink), the name, the
 * credentials, and the review date.
 *
 * Where the record's author is still the placeholder "Pending review", this
 * renders honestly rather than trying to look finished — a warning-toned
 * label, not the same quiet card a real credential gets. Hiding that state
 * would make an unreviewed page look reviewed, which is the one thing this
 * component exists to never do.
 *
 * @param {{
 *   author: { name: string, credentials: string },
 *   lastReviewed: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function ReviewerCredit({ author, lastReviewed }) {
  const pending = author.name === "Pending review";

  const initials = pending
    ? "?"
    : author.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

  return (
    <div
      className="flex items-center gap-4 rounded-card border p-5"
      style={{
        borderColor: pending
          ? "color-mix(in srgb, var(--color-warning) 45%, var(--color-rule))"
          : "var(--color-rule)",
        backgroundColor: pending
          ? "color-mix(in srgb, var(--color-warning) 6%, transparent)"
          : "var(--color-surface)",
      }}
    >
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-ink font-read text-base font-semibold text-on-brand"
      >
        {initials}
      </span>

      <div className="min-w-0">
        {pending ? (
          <p
            className="font-ui text-[0.9375rem] font-semibold"
            style={{ color: "var(--color-warning)" }}
          >
            Pending review
          </p>
        ) : (
          <p className="font-read text-base font-semibold text-label">
            {author.name}
          </p>
        )}
        <p className="mt-0.5 font-ui text-sm text-label-2">
          {pending
            ? "Not yet reviewed by a named, qualified advisor"
            : author.credentials}
        </p>
        <p className="mt-1.5 font-data text-xs text-label-2">
          Last reviewed {lastReviewed}
        </p>
      </div>
    </div>
  );
}
