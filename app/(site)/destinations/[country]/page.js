import Link from "next/link";
import { notFound } from "next/navigation";

import Badge from "@/components/primitives/Badge";
import Callout from "@/components/primitives/Callout";
import DataTable from "@/components/primitives/DataTable";
import { FieldValue } from "@/components/primitives/Unverified";
import CountryCard from "@/components/site/CountryCard";
import IntentCard from "@/components/site/IntentCard";
import { INTENTS } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllPrograms,
  getCountry,
  getPrograms,
} from "@/lib/content/loader";

/**
 * A country overview.
 *
 * This is a discovery surface, not a reference document: spacious, card-led,
 * and built to answer "what can I do here" before it answers anything else. The
 * dense treatment belongs on the program page.
 */

/**
 * @returns {Promise<Array<{ country: string }>>}
 */
export async function generateStaticParams() {
  const countries = await getAllCountries();
  return countries.map((country) => ({ country: country.slug }));
}

/**
 * @param {{ params: Promise<{ country: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { country: slug } = await params;
  const country = await getCountry(slug);
  if (!country) return {};
  return { title: country.name, description: country.summary };
}

/**
 * @param {{ params: Promise<{ country: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function CountryPage({ params }) {
  const { country: slug } = await params;

  const country = await getCountry(slug);
  if (!country) notFound();

  const [programs, allCountries, allPrograms] = await Promise.all([
    getPrograms({ country: country.slug }),
    getAllCountries(),
    getAllPrograms(),
  ]);

  /** Guide counts per country, so a related card never claims a count it does not have. */
  const programCounts = allPrograms.reduce((counts, program) => {
    counts.set(program.countrySlug, (counts.get(program.countrySlug) ?? 0) + 1);
    return counts;
  }, new Map());

  const labelForIntent = new Map(
    INTENTS.map((intent) => [intent.slug, intent.label])
  );
  const countFor = (intentSlug) =>
    programs.filter((program) => program.intent === intentSlug).length;

  const elsewhere = allCountries.filter(
    (candidate) => candidate.slug !== country.slug
  );
  const related = country.relatedCountries
    .map((relatedSlug) =>
      allCountries.find((candidate) => candidate.slug === relatedSlug)
    )
    .filter(Boolean);

  const glance = [
    { label: "Processing window", value: country.atAGlance.processingWindow },
    { label: "Typical cost range", value: country.atAGlance.typicalCostRange },
    { label: "Visa-free access", value: country.atAGlance.visaFreeNote },
  ];

  const living = [
    { label: "Cost of living", value: country.living.costOfLiving },
    { label: "Healthcare", value: country.living.healthcare },
    { label: "Schooling", value: country.living.schooling },
    { label: "Bringing family", value: country.living.bringingFamily },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-label-2">
          <li className="flex items-center gap-2">
            <Link
              href="/destinations"
              className="underline underline-offset-2 hover:text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              Destinations
            </Link>
            <span aria-hidden="true" className="text-label-3">
              /
            </span>
          </li>
          <li aria-current="page" className="text-label">
            {country.name}
          </li>
        </ol>
      </nav>

      {/* 1. Hero */}
      <header className="max-w-[68ch]">
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          {country.name}
        </h1>
        <p className="mt-5 font-read text-lg leading-relaxed text-label">
          {country.summary}
        </p>
      </header>

      <dl className="mt-10 grid gap-x-10 gap-y-6 border-y border-separator py-6 sm:grid-cols-3">
        {glance.map((entry) => (
          <div key={entry.label}>
            <dt className="font-ui text-xs uppercase tracking-wide text-label-3">
              {entry.label}
            </dt>
            <dd className="mt-2 font-read leading-relaxed text-label [overflow-wrap:anywhere]">
              <FieldValue value={entry.value} />
            </dd>
          </div>
        ))}
      </dl>

      {/* 2. Intents */}
      <section aria-labelledby="intents" className="mt-16">
        <h2 id="intents" className="text-2xl font-semibold">
          What do you want to do here?
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTENTS.map((intent) => (
            <IntentCard
              key={intent.slug}
              intent={intent}
              countrySlug={country.slug}
              count={countFor(intent.slug)}
            />
          ))}
        </div>
      </section>

      {/* 3. All programs */}
      <section aria-labelledby="programs" className="mt-16">
        <h2 id="programs" className="text-2xl font-semibold">
          All routes
        </h2>
        {programs.length > 0 ? (
          <div className="mt-6">
            <DataTable
              columns={[
                { key: "name", label: "Route", width: "22%" },
                { key: "intent", label: "Intent", width: "12%", nowrap: true },
                {
                  key: "processingTime",
                  label: "Processing time",
                  width: "30%",
                },
                { key: "validity", label: "Validity", width: "36%" },
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
                intent: (
                  <Badge tone={program.intent}>
                    {labelForIntent.get(program.intent) ?? program.intent}
                  </Badge>
                ),
                processingTime: <FieldValue value={program.processingTime} />,
                validity: <FieldValue value={program.validity} />,
              }))}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-separator bg-surface p-8">
            <h3 className="font-ui text-xl font-semibold">
              Programme guides for {country.name} are being written
            </h3>
            <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
              This destination is in the site so the country record and its
              sources can be reviewed, but no route guides exist for it yet.
              These destinations do have guides today:
            </p>
            <ul className="mt-5 space-y-2">
              {elsewhere.map((candidate) => (
                <li key={candidate.slug}>
                  <Link
                    href={`/destinations/${candidate.slug}`}
                    className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {candidate.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 4. Common requirements */}
      <section aria-labelledby="requirements" className="mt-16">
        <h2 id="requirements" className="text-2xl font-semibold">
          Common requirements
        </h2>
        {country.commonDocuments.length > 0 ? (
          <div className="mt-6">
            <DataTable
              columns={[
                { key: "name", label: "Document" },
                { key: "note", label: "Note" },
              ]}
              rows={country.commonDocuments.map((document) => ({
                name: document.name,
                note: document.note ? (
                  <FieldValue value={document.note} />
                ) : null,
              }))}
            />
          </div>
        ) : (
          <p className="mt-4 max-w-[68ch] font-read leading-relaxed text-label-2">
            The document list for {country.name} has not been compiled yet.
          </p>
        )}
      </section>

      {/* 5. Living there */}
      <section aria-labelledby="living" className="mt-16">
        <h2 id="living" className="text-2xl font-semibold">
          Living there
        </h2>
        <dl className="mt-6 grid gap-8 sm:grid-cols-2">
          {living.map((entry) => (
            <div key={entry.label}>
              <dt className="font-ui text-sm font-semibold text-label">
                {entry.label}
              </dt>
              <dd className="mt-2 max-w-[68ch] font-read leading-relaxed text-label-2">
                <FieldValue value={entry.value} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 6. Sources and review line */}
      <section aria-labelledby="sources" className="mt-16">
        <h2 id="sources" className="text-2xl font-semibold">
          Sources
        </h2>
        <Callout tone="source" sources={country.sources} />
        <p className="mt-4 border-y border-separator py-4 font-data text-sm text-label">
          Last reviewed {country.lastReviewed} — {country.author.name},{" "}
          {country.author.credentials}
        </p>
      </section>

      {/* 7. Related countries */}
      {related.length > 0 ? (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="text-2xl font-semibold">
            Related countries
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((candidate) => (
              <CountryCard
                key={candidate.slug}
                country={candidate}
                programCount={programCounts.get(candidate.slug) ?? 0}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
