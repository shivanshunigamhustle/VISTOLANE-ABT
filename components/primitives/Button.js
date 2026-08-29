/**
 * @typedef {"primary" | "primaryInk" | "secondary" | "quiet" | "quietInk" | "tint"} ButtonVariant
 */

/**
 * The ring colour lives on the variant, never on BASE.
 *
 * Two `focus-visible:outline-*` utilities in one class list are resolved by
 * stylesheet order, not by which was written last — that is how an ink button
 * once shipped a 2.97:1 ring. Each variant states its own, and each pairing is
 * measured against the ground the ring actually sits on (outline-offset puts it
 * on the parent, not on the button fill).
 *
 * @type {Record<ButtonVariant, string>}
 */
const VARIANTS = {
  // The amber accent is reserved for primary calls to action.
  primary:
    "border-transparent bg-accent text-on-accent hover:opacity-90 focus-visible:outline-tint",
  // Same accent on a brand-ink ground, where a tint ring measures 2.92:1.
  primaryInk:
    "border-transparent bg-accent text-on-accent hover:opacity-90 focus-visible:outline-on-brand",
  secondary:
    "border-transparent bg-brand text-on-brand hover:opacity-90 focus-visible:outline-tint",
  quiet:
    "border-rule bg-transparent text-label hover:bg-fill focus-visible:outline-tint",
  quietInk:
    "border-on-brand/40 bg-transparent text-on-brand hover:bg-on-brand/10 focus-visible:outline-on-brand",
  tint: "border-transparent bg-transparent text-tint hover:bg-fill focus-visible:outline-tint",
};

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border " +
  "px-5 py-2.5 text-sm font-medium no-underline " +
  "transition-[background-color,opacity,color] duration-200 motion-reduce:transition-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Renders an anchor when given an href and a button otherwise, so a navigation
 * that looks like a button is still a link.
 *
 * @param {{
 *   variant?: ButtonVariant,
 *   href?: string,
 *   type?: string,
 *   className?: string,
 *   children: React.ReactNode,
 * } & Record<string, unknown>} props
 * @returns {JSX.Element}
 */
export default function Button({
  variant = "primary",
  href,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const classes =
    `${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
