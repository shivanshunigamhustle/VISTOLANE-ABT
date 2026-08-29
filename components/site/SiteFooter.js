import Link from "next/link";

import NavItem from "@/components/site/NavItem";
import { NAV } from "@/components/site/navigation";

/**
 * The site footer.
 *
 * It carries the brand-ink ground, which is the one place the deep navy is safe:
 * --color-on-brand is white in both appearances, so the pairing holds whichever
 * way the OS is set.
 *
 * The navigation mirrors the header, but only the parts that exist. An unbuilt
 * route is omitted here rather than listed with a "Coming soon" chip: the header
 * already tells someone the section is planned, and repeating that eleven times
 * in the footer turns the whole page into a list of things we have not done.
 */

/**
 * @returns {JSX.Element}
 */
export default function SiteFooter() {
  return (
    <footer className="band-ink mt-0">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/*
            Only groups with at least one built child become a column. A heading
            with nothing under it — which is what "Destinations" was — reads as a
            missing section rather than a nav item.
          */}
          {NAV.filter((group) => group.items?.some((item) => item.href)).map(
            (group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="t-eyebrow text-on-brand opacity-70">
                  {group.href ? (
                    <Link
                      href={group.href}
                      className="text-on-brand no-underline hover:underline underline-offset-2
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {group.label}
                    </Link>
                  ) : (
                    group.label
                  )}
                </h2>
                {group.items ? (
                  <ul className="mt-3">
                    {group.items
                      .filter((item) => item.href)
                      .map((item) => (
                        <li key={item.label}>
                          <NavItem item={item} onBrand />
                        </li>
                      ))}
                  </ul>
                ) : null}
              </nav>
            )
          )}
        </div>

        {/*
          TODO(MOD-11): placeholder wording. The advisory disclaimer that ships
          must be agreed with the client and, given what this site publishes,
          reviewed by someone qualified. Do not launch with this text.
        */}
        <div className="mt-12 rounded-[var(--radius-card)] border border-on-brand/30 p-5">
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

        <div className="mt-10 flex flex-col gap-4 border-t border-on-brand/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-ui text-sm opacity-80">Vistolane</p>
          {/*
            TODO(legal): Privacy, Terms, Cookies and Accessibility pages are not
            written. They are omitted rather than listed as absent — a footer of
            "Coming soon" chips reads as an unfinished site.
          */}
        </div>
      </div>
    </footer>
  );
}
