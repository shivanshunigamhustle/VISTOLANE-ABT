import Link from "next/link";
import { Chip } from "@/components/primitives/Chip";
import CountryCard from "@/components/site/CountryCard";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
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

  const matches = countries.filter((country) => {
    const countryPrograms = byCountry.get(country.slug) ?? [];
    if (active.region && country.region !== active.region) return false;
    // A country whose band is unknown is never a match for a cost-band filter.
    // Equality already excludes it; this is explicit so it cannot regress into a
    // filter that quietly returns countries whose band was never researched.
    if (active.costBand) {
      if (country.costBand === "unknown") return false;
      if (country.costBand !== active.costBand) return false;
    }
    if (
      active.intent &&
      !countryPrograms.some((program) => program.intent === active.intent)
    ) {
      return false;
    }
    return true;
  });

  const filterCount = Object.values(active).filter(Boolean).length;

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

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/destinations" },
        ])}
      />
      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <p className="t-eyebrow text-on-brand opacity-70">Coverage</p>
          <h1 className="t-page-title mt-6 text-on-brand">{TITLE}</h1>
          <p className="t-lede mt-5 text-on-brand opacity-85">{DESCRIPTION}</p>
        </div>
      </div>

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-10">
          {filterGroups.map((group) => (
            <div key={group.key}>
              <h2 id={`filter-${group.key}`} className="t-eyebrow mb-3">
                {group.label}
              </h2>
              <div
                role="group"
                aria-labelledby={`filter-${group.key}`}
                className="flex flex-wrap items-center gap-2"
              >
                {group.options.map((option) => (
                  <Chip
                    key={option.value}
                    href={toggledHref(active, group.key, option.value)}
                    pressed={active[group.key] === option.value}
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}

          {filterCount > 0 ? (
            <p className="text-sm">
              <Link
                href="/destinations"
                className="text-tint underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Clear filters
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p aria-live="polite" className="t-data text-label-2">
          {matches.length} of {countries.length}{" "}
          {countries.length === 1 ? "destination" : "destinations"}
        </p>

        {matches.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((country) => (
              <CountryCard
                key={country.slug}
                country={country}
                programCount={(byCountry.get(country.slug) ?? []).length}
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
                className="text-tint underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
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
