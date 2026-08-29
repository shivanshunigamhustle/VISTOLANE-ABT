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
    // The six intents, pointed at the filtered destination grid. Global intent
    // hubs are a later prompt; until they exist the grid is the honest target.
    items: INTENTS.map((intent) => ({
      label: intent.label,
      href: `/destinations?intent=${intent.slug}`,
    })),
  },
  {
    label: "For Business",
    items: [
      { label: "Hire Global Talent" },
      { label: "Post a Job" },
      { label: "Partner With Us" },
    ],
  },
  { label: "Destinations", href: "/destinations" },
  {
    label: "Resources",
    items: [
      { label: "Guides" },
      { label: "Tools" },
      { label: "News" },
      { label: "Glossary" },
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
