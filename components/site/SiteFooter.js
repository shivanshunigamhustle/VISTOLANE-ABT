import Link from "next/link";

import NavItem from "@/components/site/NavItem";
import PortalLink from "@/components/site/PortalLink";
import { NAV } from "@/components/site/navigation";
import { getAllCountries } from "@/lib/content/loader";

/**
 * The site footer.
 *
 * It carries the brand-ink ground, which is the one place the deep navy is safe:
 * --color-on-brand is white in both appearances, so the pairing holds whichever
 * way the OS is set.
 *
 * Navigation mirrors the header, but only the parts that exist. An unbuilt route
 * is omitted rather than listed with a "Coming soon" chip: the header already
 * says the section is planned, and repeating that across the footer turns the
 * page into a list of things we have not done.
 *
 * The destinations column is real internal linking, not filler. Every country
 * page is one hop from every page on the site, which is exactly the link equity
 * the thin country records need.
 *
 * @returns {Promise<JSX.Element>}
 */
export default async function SiteFooter() {
  const countries = await getAllCountries();

  const columns = NAV.filter((group) => group.items?.some((item) => item.href));

  return (
    <footer className="band-ink">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <h2 className="t-eyebrow text-on-brand opacity-70">
                {group.label}
              </h2>
              <ul className="mt-3">
                {group.items
                  .filter((item) => item.href)
                  .map((item) => (
                    <li key={item.label}>
                      <NavItem item={item} onBrand />
                    </li>
                  ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Destinations">
            <h2 className="t-eyebrow text-on-brand opacity-70">
              <Link
                href="/destinations"
                className="text-on-brand no-underline underline-offset-4 hover:underline
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand"
              >
                Destinations
              </Link>
            </h2>
            <ul className="mt-3">
              {countries.map((country) => (
                <li key={country.slug}>
                  <NavItem
                    item={{
                      label: country.name,
                      href: `/destinations/${country.slug}`,
                    }}
                    onBrand
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="t-eyebrow text-on-brand opacity-70">About</h2>
            <p className="mt-3 font-read text-xl font-semibold text-on-brand">
              Vistolane
            </p>
            <p className="mt-2 max-w-[38ch] font-ui text-[0.9375rem] text-on-brand opacity-80">
              Immigration routes explained in full, with every figure traced to
              an official government source or marked on the page as unverified.
            </p>
            <div className="mt-5">
              <PortalLink onInk />
            </div>
          </div>
        </div>

        {/*
          TODO(MOD-11): placeholder wording. The advisory disclaimer that ships
          must be agreed with the client and, given what this site publishes,
          reviewed by someone qualified. Do not launch with this text.
        */}
        <div className="mt-14 rounded-[var(--radius-card)] border border-on-brand/30 p-5">
          <h2 className="t-subsection">
            Advisory disclaimer — placeholder, not for launch
          </h2>
          <p className="t-body mt-2 opacity-80">
            The wording of this disclaimer has not been agreed. It needs to
            state what this site is and is not — general information rather than
            legal advice, and no advisory relationship created by reading it —
            in terms the client and their adviser have signed off (MOD-11).
          </p>
        </div>

        {/*
          TODO(legal): Privacy, Terms, Cookies and Accessibility pages are not
          written. They are omitted rather than listed as absent — a footer of
          "Coming soon" chips reads as an unfinished site.
        */}
        <div className="mt-10 border-t border-on-brand/20 pt-6">
          <p className="font-ui text-sm text-on-brand opacity-70">Vistolane</p>
        </div>
      </div>
    </footer>
  );
}
