/**
 * The thin strip above the header, present on every page.
 *
 * Carries the brand line — the same tagline used in the site's own metadata
 * description and on the home page — rather than a disclaimer-style sentence,
 * so the strip reads as a masthead, not a compliance notice. It deliberately
 * does not carry a language switch (English-only at launch is still open,
 * OPN-11) or an "About Us" link (no such page is built yet, and this
 * codebase does not link to routes that do not exist).
 *
 * @param {{ reviewedLabel?: string | null }} props
 * @returns {JSX.Element}
 */
export default function UtilityBar({ reviewedLabel }) {
  return (
    <div className="no-print band-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2">
        <p className="font-read text-[0.8125rem] italic text-on-brand opacity-85">
          A clear path to your next move abroad.
        </p>
        {reviewedLabel ? (
          <p className="font-ui text-[0.8125rem] text-on-brand opacity-85">
            Content last reviewed{" "}
            <time className="t-data opacity-100">{reviewedLabel}</time>
          </p>
        ) : null}
      </div>
    </div>
  );
}
