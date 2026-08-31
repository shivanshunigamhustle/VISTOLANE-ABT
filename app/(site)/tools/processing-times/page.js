import Link from "next/link";

import Badge from "@/components/primitives/Badge";
import { Chip } from "@/components/primitives/Chip";
import DataTable from "@/components/primitives/DataTable";
import { FieldValue } from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import { INTENTS, getIntent } from "@/lib/content/intents";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * Processing times, compared across every route.
 *
 * Pure UI over records the loader already returns — no field is added to the
 * schema for this. Filtering and sorting are both real links to this same
 * route with different query parameters, the same server-rendered pattern as
 * /destinations, so the page works with JavaScript disabled and every view
 * is a crawlable URL.
 */

const TITLE = "Processing times";
const DESCRIPTION =
  "Current published timescales for every route on the site, side by side.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/tools/processing-times",
});

const SORTS = [
  { value: "country", label: "Country" },
  { value: "intent", label: "Intent" },
];

/**
 * @param {Record<string, string | undefined>} current
 * @param {string} key
 * @param {string} value
 * @returns {string}
 */
function hrefWith(current, key, value) {
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
  return query ? `/tools/processing-times?${query}` : "/tools/processing-times";
}

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function ProcessingTimesPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const active = {
    country: first(raw.country),
    intent: first(raw.intent),
    sort: first(raw.sort) ?? "country",
  };

  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
  ]);
  const countryName = new Map(countries.map((c) => [c.slug, c.name]));

  let rows = programs;
  if (active.country) {
    rows = rows.filter((p) => p.countrySlug === active.country);
  }
  if (active.intent) {
    rows = rows.filter((p) => p.intent === active.intent);
  }

  const intentOrder = new Map(INTENTS.map((i, index) => [i.slug, index]));
  rows = [...rows].sort((a, b) => {
    if (active.sort === "intent") {
      return (
        (intentOrder.get(a.intent) ?? 0) - (intentOrder.get(b.intent) ?? 0) ||
        a.name.localeCompare(b.name)
      );
    }
    return (
      (countryName.get(a.countrySlug) ?? a.countrySlug).localeCompare(
        countryName.get(b.countrySlug) ?? b.countrySlug
      ) || a.name.localeCompare(b.name)
    );
  });

  const filterCount = active.country || active.intent ? 1 : 0;

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Tools", path: "/tools" },
          { name: TITLE, path: "/tools/processing-times" },
        ])}
      />

      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <p className="t-eyebrow text-on-brand opacity-70">Tools</p>
          <h1 className="t-page-title mt-6 text-on-brand">{TITLE}</h1>
          <p className="t-lede mt-5 max-w-[60ch] text-on-brand opacity-85">
            {DESCRIPTION}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="space-y-6">
          <div>
            <h2 id="filter-country" className="t-eyebrow mb-3">
              Country
            </h2>
            <div
              role="group"
              aria-labelledby="filter-country"
              className="flex flex-wrap items-center gap-2"
            >
              {countries.map((country) => (
                <Chip
                  key={country.slug}
                  href={hrefWith(active, "country", country.slug)}
                  pressed={active.country === country.slug}
                >
                  {country.name}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h2 id="filter-intent" className="t-eyebrow mb-3">
              Intent
            </h2>
            <div
              role="group"
              aria-labelledby="filter-intent"
              className="flex flex-wrap items-center gap-2"
            >
              {INTENTS.map((intent) => (
                <Chip
                  key={intent.slug}
                  href={hrefWith(active, "intent", intent.slug)}
                  pressed={active.intent === intent.slug}
                >
                  {intent.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h2 id="sort-by" className="t-eyebrow mb-3">
              Sort by
            </h2>
            <div
              role="group"
              aria-labelledby="sort-by"
              className="flex flex-wrap items-center gap-2"
            >
              {SORTS.map((sort) => (
                <Chip
                  key={sort.value}
                  href={(() => {
                    const next = new URLSearchParams();
                    if (active.country) next.set("country", active.country);
                    if (active.intent) next.set("intent", active.intent);
                    next.set("sort", sort.value);
                    return `/tools/processing-times?${next.toString()}`;
                  })()}
                  pressed={active.sort === sort.value}
                >
                  {sort.label}
                </Chip>
              ))}
            </div>
          </div>

          {filterCount > 0 ? (
            <p className="text-sm">
              <Link
                href="/tools/processing-times"
                className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Clear filters
              </Link>
            </p>
          ) : null}
        </div>

        <div className="mt-10">
          {rows.length === 0 ? (
            <div className="surface-raised p-8">
              <h2 className="t-section text-label">
                No routes match those filters
              </h2>
              <p className="t-body mt-4 text-label">
                Try clearing a filter, or browse every route from the
                destination grid instead.
              </p>
              <p className="mt-6 text-sm">
                <Link
                  href="/tools/processing-times"
                  className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Clear filters
                </Link>{" "}
                ·{" "}
                <Link
                  href="/destinations"
                  className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Browse destinations
                </Link>
              </p>
            </div>
          ) : (
            <DataTable
              viewport
              caption={`${rows.length} of ${programs.length} route${programs.length === 1 ? "" : "s"}`}
              columns={[
                { key: "program", label: "Route", width: "28%" },
                { key: "country", label: "Country", width: "16%" },
                {
                  key: "intent",
                  label: "Intent",
                  width: "16%",
                  nowrap: true,
                },
                { key: "processingTime", label: "Processing time" },
                { key: "validity", label: "Validity" },
              ]}
              rows={rows.map((program) => ({
                program: (
                  <Link
                    href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                    className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {program.name}
                  </Link>
                ),
                country:
                  countryName.get(program.countrySlug) ?? program.countrySlug,
                intent: (
                  <Badge tone={program.intent}>
                    {getIntent(program.intent)?.label ?? program.intent}
                  </Badge>
                ),
                processingTime: <FieldValue value={program.processingTime} />,
                validity: <FieldValue value={program.validity} />,
              }))}
            />
          )}
        </div>
      </div>
    </main>
  );
}
