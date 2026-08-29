import { INTENT_SLUGS } from "@/lib/content/intents";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * The sitemap, generated from the loader rather than maintained by hand.
 *
 * Segmented by content type in the order a crawler benefits from: the static
 * entry points, then countries, then country + intent, then the programme pages
 * that carry the actual depth. lastModified comes from a record's lastReviewed
 * where it has one, which is honest — it is the date a person last looked at the
 * content, not the date a build ran.
 *
 * @returns {Promise<import("next").MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
  ]);

  /** @type {import("next").MetadataRoute.Sitemap} */
  const staticRoutes = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/destinations"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const countryRoutes = countries.map((country) => ({
    url: absoluteUrl(`/destinations/${country.slug}`),
    lastModified: country.lastReviewed,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Every country and intent pair is a real page, including the pairs whose
  // honest answer is "not written yet" — they are where the intent cards and the
  // programme breadcrumbs point.
  const intentRoutes = countries.flatMap((country) =>
    INTENT_SLUGS.map((intent) => ({
      url: absoluteUrl(`/destinations/${country.slug}/${intent}`),
      lastModified: country.lastReviewed,
      changeFrequency: "monthly",
      priority: 0.6,
    }))
  );

  const programRoutes = programs.map((program) => ({
    url: absoluteUrl(
      `/destinations/${program.countrySlug}/${program.intent}/${program.slug}`
    ),
    lastModified: program.lastReviewed,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...countryRoutes, ...intentRoutes, ...programRoutes];
}
