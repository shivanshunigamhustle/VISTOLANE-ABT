/**
 * Derivations over already-loaded records.
 *
 * These are not reads, so they do not belong in loader.js — that file is the
 * filesystem seam and its export list is deliberately closed. These are pure
 * functions over the arrays a page has already fetched, which also means the
 * home page derives both of these from the same two loader calls it was making
 * anyway rather than triggering a second pass over the content.
 */

/**
 * The most recent review date across a set of records.
 *
 * Compared as strings on purpose. schema.js normalises every date to a
 * YYYY-MM-DD string precisely so nothing downstream has to build a Date, and
 * lexicographic order is chronological order for that format. Parsing to Date
 * here would reintroduce the timezone bug the schema exists to prevent.
 *
 * @param {Array<{ lastReviewed?: string }>} records
 * @returns {string | null} ISO date, or null when there is nothing to report.
 */
export function latestReview(records) {
  let latest = null;
  for (const record of records ?? []) {
    const value = record?.lastReviewed;
    if (typeof value !== "string" || !value) continue;
    if (latest === null || value > latest) latest = value;
  }
  return latest;
}

/**
 * Format an ISO day for display.
 *
 * Pinned to UTC. A bare toLocaleDateString renders in the server's timezone and
 * shows the previous day for any host west of UTC, which on a "last reviewed"
 * line is a small, permanent, entirely avoidable lie.
 *
 * @param {string | null} iso
 * @returns {string | null}
 */
export function formatReviewDate(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * The distinct hostnames cited across a set of records.
 *
 * Rendered verbatim, minus a www/www2 prefix. Deliberately not filtered to
 * .gov: Germany's federal portal is a .com and the UK's is a .uk, so a TLD
 * filter would silently drop two of five countries. Deliberately not collapsed
 * to a registrable domain either — doing that correctly needs a public-suffix
 * list, and doing it naively turns Vietnam's immigration authority into
 * "gov.vn".
 *
 * @param {Array<{ sources?: Array<{ url?: string }> }>} records
 * @returns {string[]} sorted, unique
 */
export function sourceHosts(records) {
  const hosts = new Set();
  for (const record of records ?? []) {
    for (const source of record?.sources ?? []) {
      if (typeof source?.url !== "string") continue;
      try {
        hosts.add(new URL(source.url).hostname.replace(/^www\d?\./, ""));
      } catch {
        // A malformed URL cannot pass the schema, so this is unreachable in
        // practice; skipping is still the right failure mode for a strip that
        // is decoration around the real, labelled citations on the record pages.
      }
    }
  }
  return [...hosts].sort();
}
