import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * robots.txt.
 *
 * Everything is crawlable except the API surface, which serves no pages and
 * accepts a POST that has no business being fetched by a crawler.
 *
 * /kitchen-sink is not listed: it returns 404 in production, so there is nothing
 * to disallow, and naming a route in robots.txt advertises that it exists.
 *
 * @returns {import("next").MetadataRoute.Robots}
 */
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
