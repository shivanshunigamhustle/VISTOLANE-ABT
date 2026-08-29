/**
 * @typedef {"primary" | "tint" | "quiet" | "onInk"} ButtonVariant
 */

/** @type {Record<ButtonVariant, string>} */
const VARIANTS = {
  primary:
    "border-transparent bg-brand text-on-brand hover:opacity-90 focus-visible:outline-tint",
  tint: "border-transparent bg-transparent text-tint hover:bg-fill focus-visible:outline-tint",
  quiet:
    "border-rule bg-transparent text-label hover:bg-fill focus-visible:outline-tint",
  // For the brand-ink grounds, where a navy fill would disappear and a tint ring
  // measures only 2.97:1 against the ink.
  onInk:
    "border-transparent bg-on-brand text-brand-ink hover:opacity-90 focus-visible:outline-on-brand",
};

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border " +
  "px-4 py-2 text-sm font-medium no-underline " +
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
