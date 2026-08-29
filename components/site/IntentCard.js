import Link from "next/link";

/**
 * One intent.
 *
 * The hue is restated rather than washed across the card: a 3px rule along the
 * top edge and a dot beside the label. Text stays on --color-label, which is the
 * same rule Badge follows and the reason these hues are legible at all.
 *
 * An intent with nothing behind it is shown muted and inert rather than hidden.
 * Someone looking for a study route needs to know it is not covered yet, not to
 * be left wondering whether they missed it.
 *
 * `href` overrides the default country-scoped target, which is what the home
 * page needs: there are no global intent hubs yet, so an intent card there
 * points at the filtered destination grid instead.
 *
 * @param {{
 *   intent: import("@/lib/content/intents").Intent,
 *   countrySlug?: string,
 *   href?: string,
 *   count: number,
 * }} props
 * @returns {JSX.Element}
 */
export default function IntentCard({ intent, countrySlug, href, count }) {
  const hue = `var(${intent.token})`;
  // An empty intent is quietened with colour, not with opacity. Opacity on the
  // whole card dragged its label to 3.7:1; muting the tokens keeps the text
  // legible while still reading as inactive.
  const muted = count === 0;

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          backgroundColor: muted
            ? `color-mix(in srgb, ${hue} 45%, transparent)`
            : hue,
        }}
      />
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: muted
              ? `color-mix(in srgb, ${hue} 45%, transparent)`
              : hue,
          }}
        />
        <span
          className={`t-subsection ${muted ? "text-label-2" : "text-label"}`}
        >
          {intent.label}
        </span>
      </span>
      {count === 0 ? (
        <span className="mt-2 block font-ui text-[0.8125rem] text-label-2">
          Coming soon
        </span>
      ) : (
        <span className="t-data mt-2 block text-label-2">
          {count} {count === 1 ? "guide" : "guides"}
        </span>
      )}
    </>
  );

  if (count === 0) {
    return (
      <div
        aria-disabled="true"
        className="relative overflow-hidden rounded-[var(--radius-card)] border border-rule bg-transparent p-5"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href ?? `/destinations/${countrySlug}/${intent.slug}`}
      className="surface-raised relative block overflow-hidden p-5 no-underline
        transition-shadow duration-200 motion-reduce:transition-none
        hover:shadow-[0_2px_4px_rgb(0_0_0/0.06),0_8px_24px_rgb(0_0_0/0.08)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      {inner}
    </Link>
  );
}
