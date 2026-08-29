import Link from "next/link";

import NavItem from "@/components/site/NavItem";
import PortalLink from "@/components/site/PortalLink";
import { NAV } from "@/components/site/navigation";

/**
 * The site header.
 *
 * Every disclosure here is a <details>, not React state. The mobile menu and the
 * desktop dropdowns all open and close with JavaScript switched off, for the
 * same reason the destination filters are links: this site earns its traffic
 * from crawlers and from people on poor connections, and a navigation that
 * needs a bundle to open is a navigation that sometimes does not.
 *
 * The wordmark is set in var(--font-read) so the serif signature is the first
 * thing on the page. It stays on --color-label rather than the brand navy, which
 * does not carry enough contrast against the dark surface in both appearances.
 */

/**
 * @param {{ group: import("./navigation").NavGroup, panelClassName: string }} props
 * @returns {JSX.Element}
 */
function NavGroup({ group, panelClassName }) {
  if (group.href) {
    return (
      <Link
        href={group.href}
        className="block rounded-[var(--radius-control)] px-3 py-2 font-ui text-sm font-medium text-label no-underline
          transition-colors duration-200 motion-reduce:transition-none hover:bg-fill
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
      >
        {group.label}
      </Link>
    );
  }

  return (
    <details className="group/nav relative">
      <summary
        className="flex cursor-pointer list-none items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-2 font-ui text-sm font-medium text-label
          transition-colors duration-200 motion-reduce:transition-none hover:bg-fill
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint
          [&::-webkit-details-marker]:hidden"
      >
        {group.label}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 16"
          width="11"
          height="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200 motion-reduce:transition-none group-open/nav:rotate-180"
        >
          <path d="M3.5 6 8 10.5 12.5 6" />
        </svg>
      </summary>
      <div className={panelClassName}>
        <ul>
          {group.items.map((item) => (
            <li key={item.label}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/**
 * @returns {JSX.Element}
 */
export default function SiteHeader() {
  return (
    <header className="relative border-b border-rule bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        {/*
          TODO(OPN-09): text lockup standing in for the real logo, which is still
          owed by the client. When the asset arrives it replaces this span only.
        */}
        <Link
          href="/"
          className="font-read text-xl font-semibold tracking-tight text-label no-underline
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
        >
          Vistolane
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex md:items-center md:gap-1"
        >
          {NAV.map((group) => (
            <NavGroup
              key={group.label}
              group={group}
              panelClassName="absolute z-40 mt-1 min-w-56 rounded-[var(--radius-card)] border border-rule bg-surface p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_rgb(0_0_0/0.04)]"
            />
          ))}
        </nav>

        <div className="hidden md:block">
          <PortalLink />
        </div>

        <details className="md:hidden">
          <summary
            className="flex cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-rule px-3 py-2
              font-ui text-sm font-medium text-label
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint
              [&::-webkit-details-marker]:hidden"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
            </svg>
            Menu
          </summary>

          <div className="absolute left-0 right-0 top-full z-40 max-h-[80vh] overflow-y-auto border-b border-rule bg-surface px-5 py-4">
            <nav aria-label="Primary, mobile">
              <ul className="space-y-1">
                {NAV.map((group) => (
                  <li key={group.label}>
                    <NavGroup
                      group={group}
                      panelClassName="border-l border-separator pl-4 pt-1"
                    />
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4 border-t border-rule pt-4">
              <PortalLink />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
