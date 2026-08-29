import Link from "next/link";
import { notFound } from "next/navigation";

import Badge from "@/components/primitives/Badge";
import Callout from "@/components/primitives/Callout";
import DataTable from "@/components/primitives/DataTable";
import { FieldValue } from "@/components/primitives/Unverified";
import CountryCard from "@/components/site/CountryCard";
import IntentCard from "@/components/site/IntentCard";
import SectionHeading from "@/components/site/SectionHeading";
import JsonLd from "@/components/site/JsonLd";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllPrograms,
  getCountry,
  getPrograms,
} from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

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

  return pageMetadata({
    title: `${country.name} immigration routes | Vistolane`,
    description: country.summary,
    path: `/destinations/${country.slug}`,
  });
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
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: country.name, path: `/destinations/${country.slug}` },
        ])}
      />

      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-sm text-on-brand/70">
              <li className="flex items-center gap-2">
                <Link
                  href="/destinations"
                  className="text-on-brand/70 underline underline-offset-4 hover:text-on-brand
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Destinations
                </Link>
                <span aria-hidden="true" className="text-on-brand/40">
                  /
                </span>
              </li>
              <li aria-current="page" className="text-on-brand">
                {country.name}
              </li>
            </ol>
          </nav>

          <h1 className="t-page-title mt-8 text-on-brand">{country.name}</h1>
          <p className="t-body mt-6 text-on-brand opacity-85">
            {country.summary}
          </p>
        </div>
      </div>

      {/* At a glance — a mono row of pairs divided by rules, not a card. */}
      <div className="mx-auto w-full max-w-6xl px-5">
        <dl className="grid divide-y divide-rule border-b border-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {glance.map((entry) => (
            <div
              key={entry.label}
              className="py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0"
            >
              <dt className="t-eyebrow">{entry.label}</dt>
              <dd className="t-data mt-3 leading-relaxed text-label [overflow-wrap:anywhere]">
                <FieldValue value={entry.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 2. Intents */}
      <section
        aria-labelledby="intents"
        className="mx-auto w-full max-w-6xl px-5 pt-16"
      >
        <SectionHeading id="intents" eyebrow="By intent">
          What do you want to do here?
        </SectionHeading>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mx-auto w-full max-w-6xl px-5 pt-16">
        <SoftBridge country={country.slug} />
      </div>

      {/* 3. All programs */}
      <section
        aria-labelledby="programs"
        className="mx-auto w-full max-w-6xl px-5 pt-16"
      >
        <SectionHeading id="programs" eyebrow="Every route">
          All routes
        </SectionHeading>
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
          <div className="mt-6 rounded-[var(--radius-card)] border border-separator bg-surface p-8">
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
      <section
        aria-labelledby="requirements"
        className="mx-auto w-full max-w-6xl px-5 pt-16"
      >
        <SectionHeading id="requirements" eyebrow="Paperwork">
          Common requirements
        </SectionHeading>
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
      <section
        aria-labelledby="living"
        className="mx-auto w-full max-w-6xl px-5 pt-16"
      >
        <SectionHeading id="living" eyebrow="On arrival">
          Living there
        </SectionHeading>
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

      {/* 6. Sources and review line, set back on the inset band */}
      <section aria-labelledby="sources" className="band-inset mt-20">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading id="sources" eyebrow="Provenance">
            Sources
          </SectionHeading>
          <Callout tone="source" sources={country.sources} />
          <p className="t-data mt-6 border-t border-rule pt-6 text-label">
            Last reviewed {country.lastReviewed} — {country.author.name},{" "}
            {country.author.credentials}
          </p>
        </div>
      </section>

      {/* 7. Related countries */}
      {related.length > 0 ? (
        <section
          aria-labelledby="related"
          className="mx-auto w-full max-w-6xl px-5 py-16"
        >
          <SectionHeading id="related" eyebrow="Nearby">
            Related countries
          </SectionHeading>
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
