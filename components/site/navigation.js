import { INTENTS } from "@/lib/content/intents";

/**
 * The site navigation tree, defined once so the header and the footer cannot
 * drift apart.
 *
 * Navigation forks by AUDIENCE before it forks by topic. A business visitor and
 * an individual use different words for the same visa, and asking someone which
 * they are is a cheaper question than asking them to translate their situation
 * into ours.
 *
 * Items without an href are not built yet. They render as disabled with a
 * "Coming soon" affordance rather than as links to nothing — a dead link costs
 * more trust than an honest gap.
 *
 * @typedef {Object} NavItem
 * @property {string} label
 * @property {string} [href]  Absent means not built yet.
 *
 * @typedef {Object} NavGroup
 * @property {string} label
 * @property {string} [href]        A destination in its own right.
 * @property {NavItem[]} [items]    A disclosure of children.
 */

/** @type {NavGroup[]} */
export const NAV = [
  {
    label: "For Individuals",
    // The six global intent hubs, at their readable paths.
    items: INTENTS.map((intent) => ({
      label: intent.label,
      href: `/${intent.path}`,
    })),
  },
  { label: "For Business", href: "/business" },
  { label: "Destinations", href: "/destinations" },
  {
    label: "Resources",
    items: [
      { label: "Guides", href: "/resources" },
      { label: "Tools", href: "/tools" },
      { label: "News", href: "/news" },
      { label: "Glossary", href: "/glossary" },
    ],
  },
];

/**
 * Legal pages. None exist yet, so nothing renders them — the footer omits
 * unbuilt routes rather than listing them. Wire this back into SiteFooter when
 * the pages are written.
 */
export const LEGAL = [
  { label: "Privacy" },
  { label: "Terms" },
  { label: "Cookies" },
  { label: "Accessibility" },
];
