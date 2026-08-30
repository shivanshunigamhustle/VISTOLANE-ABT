import Link from "next/link";

import CountryMark from "@/components/site/CountryMark";

/**
 * The masthead every inner page opens with — one system, reused everywhere,
 * so the site reads as one product rather than five differently-built pages.
 *
 * @param {{
 *   eyebrow: string,
 *   title: string,
 *   standfirst?: string,
 *   breadcrumb: Array<{ label: string, href?: string }>,
 *   accentHue?: string,
 *   stats?: Array<{ label: string, value: React.ReactNode }>,
 *   mark?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function PageMasthead({
  eyebrow,
  title,
  standfirst,
  breadcrumb,
  accentHue,
  stats,
  mark,
}) {
  return (
    <div
      className="band-ink relative overflow-hidden"
      style={
        accentHue ? { boxShadow: `inset 0 4px 0 0 ${accentHue}` } : undefined
      }
    >
      {mark ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
        >
          <CountryMark countrySlug={mark} label="" />
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-14">
        <nav aria-label="Breadcrumb" className="hero-enter hero-enter-1">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-sm text-on-brand/70">
            {breadcrumb.map((crumb, index) => {
              const last = index === breadcrumb.length - 1;
              return (
                <li key={crumb.label} className="flex items-center gap-2">
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="text-on-brand/70 underline underline-offset-4 hover:text-on-brand
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={last ? "page" : undefined}
                      className="text-on-brand"
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!last ? (
                    <span aria-hidden="true" className="text-on-brand/40">
                      /
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <p className="hero-enter hero-enter-1 t-eyebrow mt-8 text-on-brand opacity-70">
          {eyebrow}
        </p>
        <h1 className="hero-enter hero-enter-2 t-page-title mt-3 max-w-[26ch] text-on-brand">
          {title}
        </h1>
        {standfirst ? (
          <p className="hero-enter hero-enter-3 t-lede mt-5 max-w-[68ch] text-on-brand opacity-85">
            {standfirst}
          </p>
        ) : null}

        {stats?.length ? (
          <dl className="hero-enter hero-enter-4 mt-12 grid grid-cols-2 divide-y divide-on-brand/15 border-t border-on-brand/15 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="py-4 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <dt className="font-ui text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-on-brand/60">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-data text-xl tabular-nums text-on-brand">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="pb-14" />
        )}
      </div>
    </div>
  );
}
