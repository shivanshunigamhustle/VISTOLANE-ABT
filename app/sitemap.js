import { INTENTS, INTENT_SLUGS } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllGuides,
  getAllNewsUpdates,
  getAllPrograms,
  getAllTerms,
} from "@/lib/content/loader";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * The sitemap, generated from the loader rather than maintained by hand.
 *
 * Segmented by content type in the order a crawler benefits from: the static
 * entry points, then countries, then country + intent, then the programme pages
 * that carry the actual depth, then the global intent hubs and the reference
 * content types. lastModified comes from a record's lastReviewed where it has
 * one, which is honest — it is the date a person last looked at the content,
 * not the date a build ran.
 *
 * @returns {Promise<import("next").MetadataRoute.Sitemap>}
 */
export default async function sitemap() {
  const [countries, programs, terms, guides, newsUpdates] = await Promise.all(
    [
      getAllCountries(),
      getAllPrograms(),
      getAllTerms(),
      getAllGuides(),
      getAllNewsUpdates(),
    ]
  );

  /** @type {import("next").MetadataRoute.Sitemap} */
  const staticRoutes = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/destinations"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: absoluteUrl("/business"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/tools"), changeFrequency: "monthly", priority: 0.7 },
    {
      url: absoluteUrl("/tools/processing-times"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/tools/cost-estimator"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/tools/document-checklist"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    { url: absoluteUrl("/resources"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/news"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/glossary"), changeFrequency: "monthly", priority: 0.6 },
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

  const intentHubRoutes = INTENTS.map((intent) => ({
    url: absoluteUrl(`/${intent.path}`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const termRoutes = terms.map((term) => ({
    url: absoluteUrl(`/glossary/${term.slug}`),
    lastModified: term.lastReviewed,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const guideRoutes = guides.map((guide) => ({
    url: absoluteUrl(`/resources/${guide.slug}`),
    lastModified: guide.lastReviewed,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const newsRoutes = newsUpdates.map((update) => ({
    url: absoluteUrl(`/news/${update.slug}`),
    lastModified: update.lastReviewed,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...countryRoutes,
    ...intentRoutes,
    ...programRoutes,
    ...intentHubRoutes,
    ...termRoutes,
    ...guideRoutes,
    ...newsRoutes,
  ];
}
