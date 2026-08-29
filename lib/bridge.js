/**
 * The boundary between this website and the Vistolane application.
 *
 * The website does no application work — no uploads, no case tracking, no
 * payments, no accounts. All of that lives in the separate application. This
 * module builds the links that route a qualified visitor across that boundary
 * with their context intact, and nothing else.
 *
 * The base URL and every parameter name below are provisional and have to be
 * confirmed with the application team before launch (OPN-07). They are read from
 * the environment rather than written down here, so confirming them is a config
 * change rather than a code change.
 *
 * Pure functions only. No React, no browser APIs — this has to be callable from
 * a server component, a client component and a test alike.
 */

/** Where a visitor lands when no path is given. */
const DEFAULT_PATH = "/register";

/**
 * @param {string} path
 * @returns {string} The path with exactly one leading slash and no trailing one.
 */
function normalisePath(path) {
  const trimmed = String(path ?? "").trim();
  if (!trimmed) return DEFAULT_PATH;
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.length > 1 && withLeading.endsWith("/")
    ? withLeading.slice(0, -1)
    : withLeading;
}

/**
 * The configured application base, or an empty string when it is not set.
 *
 * Reading `process.env.NEXT_PUBLIC_*` by its full literal name matters: Next
 * replaces the whole expression at build time, so a computed lookup would come
 * back undefined in the browser.
 *
 * @returns {string}
 */
export function portalBase() {
  return (process.env.NEXT_PUBLIC_PORTAL_URL ?? "").trim().replace(/\/+$/, "");
}

/**
 * The configured eligibility checker path, or an empty string when it is not set.
 *
 * @returns {string}
 */
export function eligibilityPath() {
  return (process.env.NEXT_PUBLIC_PORTAL_ELIGIBILITY_PATH ?? "").trim();
}

/**
 * Build a link into the application.
 *
 * Every argument is optional and none of them can make this throw. A missing
 * base yields a path-and-query string rather than a broken absolute URL, so an
 * unconfigured environment produces a link that is obviously wrong rather than
 * markup that is subtly broken.
 *
 * @param {{
 *   path?: string,
 *   country?: string,
 *   intent?: string,
 *   program?: string,
 *   source?: string,
 *   attribution?: Record<string, unknown>,
 * }} [options]
 * @returns {string}
 */
export function buildPortalUrl(options = {}) {
  const { path, country, intent, program, source, attribution } = options ?? {};

  const params = new URLSearchParams();
  const set = (key, value) => {
    if (value === undefined || value === null) return;
    const text = String(value).trim();
    if (text) params.set(key, text);
  };

  set("country", country);
  set("intent", intent);
  set("program", program);
  set("src", source);

  // Attribution keys are merged as-is: they are the names the ad platforms and
  // the analytics stack already use, and renaming them here would break the join
  // on the other side.
  if (attribution && typeof attribution === "object") {
    for (const [key, value] of Object.entries(attribution)) {
      set(key, value);
    }
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  return `${portalBase()}${normalisePath(path ?? DEFAULT_PATH)}${suffix}`;
}
