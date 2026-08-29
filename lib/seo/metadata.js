import { confirmedText } from "@/lib/content/unverified";

/**
 * Shared metadata construction.
 *
 * Titles are absolute rather than templated, because one route — the programme
 * page — has a prescribed shape that a single template cannot produce, and two
 * different separators across the site reads like a mistake.
 *
 * TODO(OPN-09): no OpenGraph or Twitter image is emitted. Generating one with
 * next/og means embedding a font file, which collides with this project's
 * no-web-font constraint, and there is no logo to build a static card from. When
 * the logo lands, add the image here and switch the Twitter card to
 * summary_large_image — until then "summary" is the honest card type.
 *
 * TODO(OPN-11): no hreflang. The origin-market languages are undecided, and
 * implementing it speculatively would change the content schema — every record
 * would need a locale and a translation group. Not guessed at.
 */

/** Site name, used in titles and OpenGraph. */
export const SITE_NAME = "Vistolane";

/**
 * Absolute origin, without a trailing slash.
 *
 * @returns {string}
 */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");
}

/**
 * An absolute URL for a site-relative path.
 *
 * @param {string} [path]
 * @returns {string}
 */
export function absoluteUrl(path = "/") {
  const clean = String(path ?? "/").trim() || "/";
  const withLeading = clean.startsWith("/") ? clean : `/${clean}`;
  return `${siteUrl()}${withLeading === "/" ? "/" : withLeading.replace(/\/+$/, "")}`;
}

/**
 * Trim to a length without cutting a word in half.
 *
 * @param {string} value
 * @param {number} [max]
 * @returns {string}
 */
export function truncateOnWord(value, max = 155) {
  const text = confirmedText(value).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const stem = (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut)
    .replace(/[\s,;:.—–-]+$/u, "")
    .trim();
  return `${stem}…`;
}

/**
 * Build a Next metadata object with a canonical, OpenGraph and a Twitter card.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   path: string,
 *   type?: "website" | "article",
 * }} options
 * @returns {import("next").Metadata}
 */
export function pageMetadata({ title, description, path, type = "website" }) {
  const url = absoluteUrl(path);
  const summary = truncateOnWord(description);

  return {
    title: { absolute: title },
    description: summary,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: summary,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en",
    },
    twitter: {
      card: "summary",
      title,
      description: summary,
    },
  };
}
