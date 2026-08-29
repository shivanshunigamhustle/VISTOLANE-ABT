/**
 * Permanent redirects, wired into next.config.mjs.
 *
 * THE RULE THIS EXISTS TO ENFORCE: any URL that changes gets a 301 recorded
 * here. Never a silent re-slug. A page that has been indexed and linked to is an
 * asset; changing its address without a redirect throws that asset away, and on
 * a site whose entire commercial justification is organic search that is the
 * most expensive mistake available.
 *
 * That applies to renaming a country, renaming a programme, restructuring the
 * path, and to correcting a typo in a slug. If the old URL was ever deployed, it
 * gets an entry.
 *
 * Country slugs are plain English country names — "united-kingdom", not "gb" or
 * "uk". ISO codes are for the `iso2` field on the record, never for the URL:
 * nobody searches for an ISO code, and a slug that reads as a word is the one a
 * person can retype from memory.
 *
 * @type {Array<{ source: string, destination: string, permanent: boolean }>}
 */
export const redirects = [];

/**
 * @returns {Promise<typeof redirects>}
 */
export async function redirectRules() {
  return redirects;
}
