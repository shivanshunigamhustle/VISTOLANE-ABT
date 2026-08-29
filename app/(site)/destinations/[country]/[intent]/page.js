import Link from "next/link";
import { notFound } from "next/navigation";

import DataTable from "@/components/primitives/DataTable";
import { FieldValue } from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import ProgramCard from "@/components/site/ProgramCard";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS, INTENT_SLUGS } from "@/lib/content/intents";
import {
  getAllCountries,
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

  const programs = await getPrograms({
    country: country.slug,
    intent: intent.slug,
  });

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
    <main id="main-content" className="mx-auto w-full max-w-6xl px-5 py-16">
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

      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-label-2">
          {[
            { href: "/destinations", label: "Destinations" },
            { href: `/destinations/${country.slug}`, label: country.name },
          ].map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <Link
                href={crumb.href}
                className="underline underline-offset-2 hover:text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                {crumb.label}
              </Link>
              <span aria-hidden="true" className="text-label-3">
                /
              </span>
            </li>
          ))}
          <li aria-current="page" className="text-label">
            {intent.label}
          </li>
        </ol>
      </nav>

      <header className="max-w-[68ch]">
        <h1 className="text-4xl font-semibold leading-tight">
          {intent.label} in {country.name}
        </h1>
        <p className="mt-5 font-read text-lg leading-relaxed text-label-2">
          {programs.length > 0
            ? `${programs.length} ${programs.length === 1 ? "route" : "routes"} covered so far. Each guide sets out who it suits, what it requires and what it costs, with every figure traced to an official source or marked as unverified.`
            : `No routes for this intent have been written yet.`}
        </p>
      </header>

      <div className="mt-12">
        <SoftBridge
          country={country.slug}
          intent={intent.slug}
          intentLabel={intent.label}
        />
      </div>

      {programs.length > 0 ? (
        <>
          <section aria-labelledby="compare" className="mt-14">
            <h2 id="compare" className="text-2xl font-semibold">
              Compare
            </h2>
            <div className="mt-6">
              <DataTable
                columns={[
                  { key: "name", label: "Route", width: "24%" },
                  {
                    key: "processingTime",
                    label: "Processing time",
                    width: "32%",
                  },
                  { key: "validity", label: "Validity", width: "34%" },
                  {
                    key: "extendable",
                    label: "Extendable",
                    width: "10%",
                    nowrap: true,
                  },
                ]}
                rows={programs.map((program) => ({
                  name: (
                    <Link
                      href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                      className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {program.name}
                    </Link>
                  ),
                  processingTime: <FieldValue value={program.processingTime} />,
                  validity: <FieldValue value={program.validity} />,
                  extendable: program.extendable ? "Yes" : "No",
                }))}
              />
            </div>
          </section>

          <section aria-labelledby="routes" className="mt-14">
            <h2 id="routes" className="text-2xl font-semibold">
              Routes
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
        <div className="mt-12 rounded-2xl border border-separator bg-surface p-8">
          <h2 className="font-ui text-xl font-semibold">
            Guides for {intent.label.toLowerCase()} in {country.name} are being
            written
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
                      className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
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
              record and its sources are in place so they can be reviewed first.
            </p>
          )}
          <p className="mt-6 text-sm">
            <Link
              href={`/destinations/${country.slug}`}
              className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              Back to {country.name}
            </Link>
          </p>
        </div>
      )}
    </main>
  );
}
