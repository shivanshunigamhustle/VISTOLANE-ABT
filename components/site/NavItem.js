import Link from "next/link";

/**
 * One navigation entry.
 *
 * An entry with no href is a route that does not exist yet. It renders as
 * non-interactive text with a visible "Coming soon" marker, so the reader learns
 * the section is planned rather than clicking into a 404.
 *
 * The `onBrand` variant exists because the footer sits on the brand fill, where
 * --color-label-2 would vanish. It is a real variant rather than an override
 * class, so the colour does not depend on which utility happens to come last in
 * the generated stylesheet.
 *
 * @param {{ item: import("./navigation").NavItem, onBrand?: boolean }} props
 * @returns {JSX.Element}
 */
export default function NavItem({ item, onBrand = false }) {
  // label-3 is a 0.30 alpha and measures ~2.2:1; a "Coming soon" item still has
  // to be readable, so disabled entries sit on label-2 like other secondary text.
  const restingText = onBrand ? "text-on-brand opacity-80" : "text-label-2";
  const linkText = onBrand
    ? "text-on-brand opacity-80 hover:opacity-100"
    : "text-label-2 hover:text-label";
  const chip = onBrand
    ? "border border-on-brand/40 text-on-brand"
    : "bg-fill text-label-2";

  if (!item.href) {
    return (
      <span
        aria-disabled="true"
        className={`flex flex-wrap items-center gap-2 py-1.5 text-sm ${restingText}`}
      >
        {item.label}
        <span
          className={`rounded px-1.5 py-0.5 font-ui text-[0.6875rem] font-medium ${chip}`}
        >
          Coming soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={`block py-1.5 text-sm no-underline underline-offset-2
        transition-colors duration-200 motion-reduce:transition-none hover:underline
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint ${linkText}`}
    >
      {item.label}
    </Link>
  );
}
