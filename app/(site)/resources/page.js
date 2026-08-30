import Link from "next/link";

import { Chip } from "@/components/primitives/Chip";
import Icon from "@/components/site/IconSet";
import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import SectionMarker from "@/components/site/SectionMarker";
import { INTENTS, getIntent } from "@/lib/content/intents";
import { getAllCountries, getAllGuides } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

const TITLE = "Guides";
const DESCRIPTION =
  "Explainers that sit alongside the route guides: how to compare routes across countries, and how to read the figures on them.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/resources",
});

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function ResourcesIndexPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const activeIntent = first(raw.intent);

  const [guides, countries] = await Promise.all([
    getAllGuides(),
    getAllCountries(),
  ]);
  const matches = activeIntent
    ? guides.filter((g) => g.intent === activeIntent)
    : guides;

  const countryLookup = new Map(countries.map((c) => [c.slug, c.name]));
  const crossCountryCount = guides.filter((g) => g.countries.length > 1).length;
  const countriesTouched = new Set(guides.flatMap((g) => g.countries)).size;

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/resources" },
        ])}
      />

      <PageMasthead
        eyebrow="Reference"
        title={TITLE}
        standfirst={DESCRIPTION}
        breadcrumb={[{ label: "Home", href: "/" }, { label: TITLE }]}
        stats={[
          { label: "Guides", value: guides.length },
          { label: "Countries covered", value: countriesTouched },
          { label: "Cross-country comparisons", value: crossCountryCount },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <SectionMarker eyebrow="Filter" title="Browse by intent" />

        <div
          role="group"
          aria-label="Filter by intent"
          className="mt-6 flex flex-wrap gap-2"
        >
          <Chip href="/resources" pressed={!activeIntent}>
            All guides
          </Chip>
          {INTENTS.map((intent) => (
            <Chip
              key={intent.slug}
              href={`/resources?intent=${intent.slug}`}
              pressed={activeIntent === intent.slug}
            >
              {intent.label}
            </Chip>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="surface-raised mt-10 p-8">
            <h2 className="t-section text-label">
              No guides for that intent yet
            </h2>
            <p className="mt-6 text-sm">
              <Link
                href="/resources"
                className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                See all guides
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <p aria-live="polite" className="t-data mb-6 text-label-2">
              {matches.length} guide{matches.length === 1 ? "" : "s"}
            </p>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((guide) => {
                const intent = guide.intent ? getIntent(guide.intent) : null;
                const countryNames = guide.countries
                  .map((slug) => countryLookup.get(slug))
                  .filter(Boolean);
                return (
                  <li key={guide.slug}>
                    <Link
                      href={`/resources/${guide.slug}`}
                      className="lift-card surface-raised flex h-full flex-col p-6 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {intent ? (
                          <span
                            className="t-eyebrow"
                            style={{ color: `var(${intent.token})` }}
                          >
                            {intent.label}
                          </span>
                        ) : (
                          <span className="t-eyebrow text-label-2">
                            Cross-route
                          </span>
                        )}
                        {guide.countries.length > 1 ? (
                          <Icon
                            name="pin"
                            size={16}
                            className="shrink-0 text-label-3"
                          />
                        ) : null}
                      </div>
                      <h2 className="t-subsection mt-2 text-label">
                        {guide.title}
                      </h2>
                      <p className="mt-2 flex-1 font-read text-sm text-label-2">
                        {guide.standfirst}
                      </p>
                      {countryNames.length > 0 ? (
                        <p className="mt-4 text-xs text-label-3">
                          {countryNames.join(" · ")}
                        </p>
                      ) : null}
                      <p className="t-data mt-2 text-xs text-label-2">
                        {guide.readingTime} min read
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
