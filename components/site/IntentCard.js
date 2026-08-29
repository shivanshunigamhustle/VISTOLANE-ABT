import Link from "next/link";
/**
 * One intent on a country page.
 *
 * The intent hue fills the card and paints a rail down its left edge, and never
 * touches the text — the same rule the Badge follows, for the same reason.
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
  const style = {
    borderLeftColor: hue,
    backgroundColor: `color-mix(in srgb, ${hue} 8%, transparent)`,
  };

  const inner = (
    <>
      <span className="font-ui text-base font-semibold text-label">
        {intent.label}
      </span>
      <span className="mt-1 block font-data text-sm tabular-nums text-label-2">
        {count === 0
          ? "Coming soon"
          : `${count} ${count === 1 ? "guide" : "guides"}`}
      </span>
    </>
  );

  if (count === 0) {
    return (
      <div
        aria-disabled="true"
        className="rounded-xl border border-separator border-l-2 p-5 opacity-60"
        style={style}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href ?? `/destinations/${countrySlug}/${intent.slug}`}
      className="block rounded-xl border border-separator border-l-2 p-5 no-underline
        transition-opacity duration-200 motion-reduce:transition-none hover:opacity-90
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
      style={style}
    >
      {inner}
    </Link>
  );
}
