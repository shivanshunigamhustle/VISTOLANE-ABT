/**
 * The six intents a traveller can arrive with.
 *
 * These slugs are a fixed contract with the Vistolane application: they are the
 * query parameters it already sends, so renaming one silently breaks inbound
 * links. Do not rename them, do not re-map a slug to a different meaning, and do
 * not extend the list without an explicit decision.
 *
 * The `token` on each entry is the CSS custom property in styles/tokens.css that
 * carries that intent's colour. It is the only colour reference an intent
 * carries — components resolve it through the Tailwind theme, never as a hex.
 */

/**
 * @typedef {"visitor" | "work" | "study" | "family" | "investor" | "residence"} IntentSlug
 */

/**
 * @typedef {Object} Intent
 * @property {IntentSlug} slug  URL segment and query-parameter identifier.
 * @property {string} label     Human-facing name.
 * @property {string} token     CSS custom property holding this intent's colour.
 */

/** @type {ReadonlyArray<Intent>} */
export const INTENTS = Object.freeze([
  Object.freeze({
    slug: "visitor",
    label: "Visit or Travel",
    token: "--intent-visitor",
  }),
  Object.freeze({
    slug: "work",
    label: "Work Abroad",
    token: "--intent-work",
  }),
  Object.freeze({
    slug: "study",
    label: "Study Abroad",
    token: "--intent-study",
  }),
  Object.freeze({
    slug: "family",
    label: "Join Family",
    token: "--intent-family",
  }),
  Object.freeze({
    slug: "investor",
    label: "Invest & Start Up",
    token: "--intent-investor",
  }),
  Object.freeze({
    slug: "residence",
    label: "Settle & Citizenship",
    token: "--intent-residence",
  }),
]);

/**
 * The six slugs on their own, in the same order as INTENTS. Used to build the
 * program schema's enum and to check directory names on load.
 *
 * @type {ReadonlyArray<IntentSlug>}
 */
export const INTENT_SLUGS = Object.freeze(INTENTS.map((intent) => intent.slug));

/**
 * Look up one intent.
 *
 * @param {string} slug
 * @returns {Intent | null} The intent, or null when the slug is not one of the six.
 */
export function getIntent(slug) {
  return INTENTS.find((intent) => intent.slug === slug) ?? null;
}
