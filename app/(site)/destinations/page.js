import Link from "next/link";
import { Chip } from "@/components/primitives/Chip";
import CountryCard from "@/components/site/CountryCard";
import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import SectionMarker from "@/components/site/SectionMarker";
import { INTENTS } from "@/lib/content/intents";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The destination grid.
 *
 * Filtering is server-rendered from searchParams, and every filter chip is a
 * real link to the same route with different query parameters. That is the
 * whole point: each filtered view has its own URL, renders without JavaScript,
 * and can be crawled. Organic search is what this site is for, so a filter that
 * only exists in client state would be a filter that does not exist.
 *
 * Each chip shows how many destinations it would leave — a chip that would
 * leave zero renders muted and inert rather than becoming a link into an
 * empty page.
 */

const TITLE = "Destinations";
const DESCRIPTION = "Countries covered, and the routes available in each.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  // Canonical is the unfiltered grid. Filtered views share this canonical
  // rather than competing with it for the same query.
  path: "/destinations",
});

/** Cost bands in their natural order, for the filter row. */
const COST_BANDS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

/**
 * Build a URL for this route with one filter toggled and the rest preserved.
 *
 * @param {Record<string, string | undefined>} current
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function toggledHref(current, key, value) {
  const next = new URLSearchParams();
  for (const [name, existing] of Object.entries(current)) {
    if (existing) next.set(name, existing);
  }
  if (next.get(key) === value) {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  const query = next.toString();
  return query ? `/destinations?${query}` : "/destinations";
}

/**
 * @param {import("@/lib/content/schema").Country[]} countries
 * @param {Map<string, import("@/lib/content/schema").Program[]>} byCountry
 * @param {{ intent?: string, region?: string, costBand?: string }} facets
 * @returns {import("@/lib/content/schema").Country[]}
 */
function applyFilters(countries, byCountry, facets) {
  return countries.filter((country) => {
    const countryPrograms = byCountry.get(country.slug) ?? [];
    if (facets.region && country.region !== facets.region) return false;
    if (facets.costBand) {
      if (country.costBand === "unknown") return false;
      if (country.costBand !== facets.costBand) return false;
    }
    if (
      facets.intent &&
      !countryPrograms.some((program) => program.intent === facets.intent)
    ) {
      return false;
    }
    return true;
  });
}

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function DestinationsPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const active = {
    intent: first(raw.intent),
    region: first(raw.region),
    costBand: first(raw.costBand),
  };

  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
  ]);

  /** @type {Map<string, import("@/lib/content/schema").Program[]>} */
  const byCountry = new Map();
  for (const program of programs) {
    const list = byCountry.get(program.countrySlug) ?? [];
    list.push(program);
    byCountry.set(program.countrySlug, list);
  }

  const regions = [
    ...new Set(countries.map((country) => country.region)),
  ].sort();

  const matches = applyFilters(countries, byCountry, active);

  const filterCount = Object.values(active).filter(Boolean).length;

  /** Result count if this one option were toggled on, other facets held. */
  const countIfToggled = (key, value) => {
    const next = { ...active };
    next[key] = next[key] === value ? undefined : value;
    return applyFilters(countries, byCountry, next).length;
  };

  const filterGroups = [
    {
      key: "intent",
      label: "Intent",
      options: INTENTS.map((intent) => ({
        value: intent.slug,
        label: intent.label,
      })),
    },
    {
      key: "region",
      label: "Region",
      options: regions.map((region) => ({ value: region, label: region })),
    },
    { key: "costBand", label: "Cost band", options: COST_BANDS },
  ];

  const activeSummary = filterGroups.flatMap((group) => {
    const value = active[group.key];
    if (!value) return [];
    const option = group.options.find((o) => o.value === value);
    return [{ key: group.key, label: option?.label ?? value }];
  });

  const totalSources = countries.reduce(
    (sum, country) => sum + country.sources.length,
    0
  );

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/destinations" },
        ])}
      />

      <PageMasthead
        eyebrow="Coverage"
        title={TITLE}
        standfirst={DESCRIPTION}
        breadcrumb={[{ label: "Home", href: "/" }, { label: TITLE }]}
        stats={[
          { label: "Countries", value: countries.length },
          { label: "Route guides", value: programs.length },
          { label: "Sources cited", value: totalSources },
        ]}
      />

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl space-y-5 px-5 py-10">
          {filterGroups.map((group) => (
            <div
              key={group.key}
              className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6"
            >
              <h2
                id={`filter-${group.key}`}
                className="t-eyebrow shrink-0 md:w-32 md:text-right"
              >
                {group.label}
              </h2>
              <div
                role="group"
                aria-labelledby={`filter-${group.key}`}
                className="flex flex-1 flex-wrap items-center gap-2"
              >
                {group.options.map((option) => {
                  const count = countIfToggled(group.key, option.value);
                  const pressed = active[group.key] === option.value;
                  const dead = count === 0 && !pressed;

                  if (dead) {
                    return (
                      <span
                        key={option.value}
                        aria-disabled="true"
                        className="inline-flex items-center gap-1.5 rounded-pill border border-separator px-3 py-1.5 text-sm text-label-3"
                      >
                        {option.label}{" "}
                        <span className="font-data text-xs">(0)</span>
                      </span>
                    );
                  }

                  return (
                    <Chip
                      key={option.value}
                      href={toggledHref(active, group.key, option.value)}
                      pressed={pressed}
                    >
                      {option.label}{" "}
                      <span className="font-data text-xs opacity-70">
                        ({count})
                      </span>
                    </Chip>
                  );
                })}
              </div>
            </div>
          ))}

          {filterCount > 0 ? (
            <div className="flex justify-end">
              <Link
                href="/destinations"
                className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Clear all
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <SectionMarker
          eyebrow="Result"
          className="mb-2"
          trailing={
            activeSummary.length > 0 ? (
              <ul
                className="flex flex-wrap items-center gap-2"
                aria-label="Active filters"
              >
                {activeSummary.map((entry) => (
                  <li key={entry.key}>
                    <Link
                      href={toggledHref(active, entry.key, active[entry.key])}
                      className="color-transition inline-flex items-center gap-1.5 rounded-pill bg-fill px-3 py-1 font-ui text-xs font-medium text-label no-underline hover:bg-separator focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {entry.label}
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 16 16"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" />
                      </svg>
                      <span className="sr-only">, remove filter</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null
          }
        >
          {matches.length} of {countries.length}{" "}
          {countries.length === 1 ? "destination" : "destinations"}
        </SectionMarker>

        {matches.length > 0 ? (
          <div
            className={`mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 ${
              matches.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {matches.map((country) => (
              <CountryCard
                key={country.slug}
                country={country}
                programCount={(byCountry.get(country.slug) ?? []).length}
                coveredIntents={[
                  ...new Set(
                    (byCountry.get(country.slug) ?? []).map((p) => p.intent)
                  ),
                ]}
              />
            ))}
          </div>
        ) : (
          <div className="surface-raised mt-8 p-8">
            <h2 className="t-section text-label">
              No destination matches those filters yet
            </h2>
            <p className="t-body mt-4 text-label">
              Coverage is still being written, so a filter can exclude
              everything. These destinations have guides today:
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {countries
                .filter(
                  (country) => (byCountry.get(country.slug) ?? []).length > 0
                )
                .map((country) => (
                  <li key={country.slug}>
                    <Chip href={`/destinations/${country.slug}`}>
                      {country.name}
                    </Chip>
                  </li>
                ))}
            </ul>
            <p className="mt-6 text-sm">
              <Link
                href="/destinations"
                className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Clear filters
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
