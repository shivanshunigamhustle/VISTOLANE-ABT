import Link from "next/link";
import { notFound } from "next/navigation";

import DataTable from "@/components/primitives/DataTable";
import {
  countUnverified,
  FieldValue,
  SummaryValue,
} from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import ProgramCard from "@/components/site/ProgramCard";
import SectionMarker from "@/components/site/SectionMarker";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS, INTENT_SLUGS } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllGuides,
  getCountry,
  getIntent,
  getPrograms,
} from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The routes available for one country and one intent.
 *
 * Every country and intent pair is generated, including the pairs with nothing
 * behind them. An intent that is not covered yet still needs a page that says
 * so — it is where the country page's intent cards point, and where the program
 * page's breadcrumb resolves.
 */

/**
 * @returns {Promise<Array<{ country: string, intent: string }>>}
 */
export async function generateStaticParams() {
  const countries = await getAllCountries();
  return countries.flatMap((country) =>
    INTENT_SLUGS.map((intent) => ({ country: country.slug, intent }))
  );
}

/**
 * @param {{ params: Promise<{ country: string, intent: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { country: countrySlug, intent: intentSlug } = await params;
  const [country, intent] = await Promise.all([
    getCountry(countrySlug),
    getIntent(intentSlug),
  ]);
  if (!country || !intent) return {};

  return pageMetadata({
    title: `${intent.label} in ${country.name} | Vistolane`,
    description: `Routes for ${intent.label.toLowerCase()} in ${country.name}, with requirements, documents, fees and processing times for each.`,
    path: `/destinations/${country.slug}/${intent.slug}`,
  });
}

/**
 * @param {{ params: Promise<{ country: string, intent: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function CountryIntentPage({ params }) {
  const { country: countrySlug, intent: intentSlug } = await params;

  const [country, intent] = await Promise.all([
    getCountry(countrySlug),
    getIntent(intentSlug),
  ]);
  if (!country || !intent) notFound();

  const hue = `var(${intent.token})`;

  const [programs, allGuides] = await Promise.all([
    getPrograms({ country: country.slug, intent: intent.slug }),
    getAllGuides(),
  ]);
  const programSlugs = new Set(programs.map((p) => p.slug));
  const problems = allGuides
    .filter((g) => (g.relatedPrograms ?? []).some((s) => programSlugs.has(s)))
    .slice(0, 4);

  const otherIntents = await Promise.all(
    INTENTS.filter((candidate) => candidate.slug !== intent.slug).map(
      async (candidate) => ({
        intent: candidate,
        count: (
          await getPrograms({ country: country.slug, intent: candidate.slug })
        ).length,
      })
    )
  );
  const covered = otherIntents.filter((entry) => entry.count > 0);

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: country.name, path: `/destinations/${country.slug}` },
          {
            name: intent.label,
            path: `/destinations/${country.slug}/${intent.slug}`,
          },
        ])}
      />

      <PageMasthead
        eyebrow="Side by side"
        title={`${intent.label} in ${country.name}`}
        standfirst={
          programs.length > 0
            ? `${programs.length} ${programs.length === 1 ? "route" : "routes"} covered so far. Each guide sets out who it suits, what it requires and what it costs, with every figure traced to an official source or marked as unverified.`
            : "No routes for this intent have been written yet."
        }
        accentHue={hue}
        breadcrumb={[
          { label: "Destinations", href: "/destinations" },
          { label: country.name, href: `/destinations/${country.slug}` },
          { label: intent.label },
        ]}
        stats={[
          { label: "Routes", value: programs.length },
          {
            label: "Other intents covered",
            value: `${covered.length} of ${otherIntents.length}`,
          },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 pt-16">
        <SoftBridge
          country={country.slug}
          intent={intent.slug}
          intentLabel={intent.label}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pb-16">
        {problems.length > 0 ? (
          <section aria-labelledby="problems" className="mt-14">
            <SectionMarker id="problems" eyebrow="Start here" hue={hue}>
              Something already gone wrong?
            </SectionMarker>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {problems.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/resources/${guide.slug}`}
                    className="lift-card surface-raised flex h-full flex-col gap-2 border-t-2 p-4 no-underline
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    style={{ borderTopColor: "var(--color-warning)" }}
                  >
                    <span className="font-ui text-[0.9375rem] font-semibold leading-snug text-label">
                      {guide.title}
                    </span>
                    <span className="font-ui text-[0.8125rem] leading-snug text-label-2">
                      {guide.standfirst}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {programs.length > 0 ? (
          <>
            <section aria-labelledby="compare" className="mt-14">
              <SectionMarker id="compare" eyebrow="Side by side" hue={hue}>
                Compare
              </SectionMarker>
              <div className="mt-6">
                <DataTable
                  caption={`${programs.length} route${programs.length === 1 ? "" : "s"} for ${intent.label.toLowerCase()} in ${country.name}.`}
                  columns={[
                    { key: "name", label: "Route", width: "24%" },
                    {
                      key: "processingTime",
                      label: "Processing time",
                      width: "30%",
                      mono: true,
                    },
                    { key: "validity", label: "Validity", width: "32%" },
                    {
                      key: "extendable",
                      label: "Extendable",
                      width: "14%",
                      nowrap: true,
                    },
                  ]}
                  rows={programs.map((program) => ({
                    rowAccent: hue,
                    name: (
                      <Link
                        href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                        className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                      >
                        {program.name}
                      </Link>
                    ),
                    processingTime: (
                      <SummaryValue value={program.processingTime} />
                    ),
                    validity: <SummaryValue value={program.validity} />,
                    extendable: program.extendable ? "Yes" : "No",
                  }))}
                />
                {(() => {
                  const { unverified, total } = countUnverified(
                    programs.flatMap((p) => [p.processingTime, p.validity])
                  );
                  if (unverified === 0) return null;
                  return (
                    <p className="mt-3 font-ui text-[0.8125rem] text-label-2">
                      {unverified} of {total} figures on this table are not yet
                      verified — see each guide for detail.
                    </p>
                  );
                })()}
              </div>
            </section>

            <section aria-labelledby="routes" className="mt-14">
              <SectionMarker id="routes" eyebrow="Guides" hue={hue}>
                Routes
              </SectionMarker>
              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {programs.map((program) => (
                  <ProgramCard
                    key={program.slug}
                    program={program}
                    intentLabel={intent.label}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="surface-raised mt-12 p-8">
            <h2 className="t-section text-label">
              Guides for {intent.label.toLowerCase()} in {country.name} are
              being written
            </h2>
            {covered.length > 0 ? (
              <>
                <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
                  These intents are covered for {country.name} today:
                </p>
                <ul className="mt-5 space-y-2">
                  {covered.map((entry) => (
                    <li key={entry.intent.slug}>
                      <Link
                        href={`/destinations/${country.slug}/${entry.intent.slug}`}
                        className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                      >
                        {entry.intent.label}
                      </Link>{" "}
                      <span className="font-data text-sm tabular-nums text-label-2">
                        ({entry.count})
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
                No routes have been written for {country.name} yet. The country
                record and its sources are in place so they can be reviewed
                first.
              </p>
            )}
            <p className="mt-6 text-sm">
              <Link
                href={`/destinations/${country.slug}`}
                className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Back to {country.name}
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
