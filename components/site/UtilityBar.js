/**
 * The thin strip above the header, present on every page.
 *
 * Only claims that are true everywhere live here: that the site is built from
 * official sources, and — when the caller has one — the most recent content
 * review date. It deliberately does not carry a language switch (English-only
 * at launch is still open, OPN-11) or an "About Us" link (no such page is
 * built yet, and this codebase does not link to routes that do not exist).
 *
 * @param {{ reviewedLabel?: string | null }} props
 * @returns {JSX.Element}
 */
export default function UtilityBar({ reviewedLabel }) {
  return (
    <div className="band-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2">
        <p className="font-ui text-[0.8125rem] text-on-brand opacity-85">
          Immigration guidance built from official government sources.
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
