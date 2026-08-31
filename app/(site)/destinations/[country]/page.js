import Link from "next/link";
import { notFound } from "next/navigation";

import Badge from "@/components/primitives/Badge";
import DataTable from "@/components/primitives/DataTable";
import {
  countUnverified,
  FieldValue,
  SummaryValue,
} from "@/components/primitives/Unverified";
import CountryCard from "@/components/site/CountryCard";
import CountryMark from "@/components/site/CountryMark";
import IntentCard from "@/components/site/IntentCard";
import JsonLd from "@/components/site/JsonLd";
import LatestUpdates from "@/components/site/LatestUpdates";
import LivingIcon from "@/components/site/LivingIcon";
import ProvenancePanel from "@/components/site/ProvenancePanel";
import ReviewerCredit from "@/components/site/ReviewerCredit";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllGuides,
  getAllPrograms,
  getCountry,
  getNewsUpdatesFor,
  getPrograms,
} from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * A country overview.
 *
 * This is a discovery surface, not a reference document: spacious, card-led,
 * and built to answer "what can I do here" before it answers anything else.
 * The dense treatment belongs on the program page. That does not mean plain
 * — the masthead, the routes table and the provenance and reviewer blocks
 * carry real craft, because this is the hinge page between the home page
 * and the reference documents underneath it.
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

  const [programs, allCountries, allPrograms, newsUpdates, allGuides] =
    await Promise.all([
      getPrograms({ country: country.slug }),
      getAllCountries(),
      getAllPrograms(),
      getNewsUpdatesFor({ country: country.slug }),
      getAllGuides(),
    ]);
  const programSlugs = new Set(programs.map((p) => p.slug));
  const problems = allGuides
    .filter((g) => (g.relatedPrograms ?? []).some((s) => programSlugs.has(s)))
    .slice(0, 4);

  /** Guide counts per country, so a related card never claims a count it does not have. */
  const programCounts = allPrograms.reduce((counts, program) => {
    counts.set(program.countrySlug, (counts.get(program.countrySlug) ?? 0) + 1);
    return counts;
  }, new Map());
  const intentsByCountry = allPrograms.reduce((map, program) => {
    const set = map.get(program.countrySlug) ?? new Set();
    set.add(program.intent);
    map.set(program.countrySlug, set);
    return map;
  }, new Map());

  const labelForIntent = new Map(
    INTENTS.map((intent) => [intent.slug, intent.label])
  );
  const tokenForIntent = new Map(
    INTENTS.map((intent) => [intent.slug, intent.token])
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
    {
      label: "Cost of living",
      value: country.living.costOfLiving,
      icon: "cost",
    },
    {
      label: "Healthcare",
      value: country.living.healthcare,
      icon: "healthcare",
    },
    { label: "Schooling", value: country.living.schooling, icon: "schooling" },
    {
      label: "Bringing family",
      value: country.living.bringingFamily,
      icon: "family",
    },
  ];

  const intentsCovered = intentsByCountry.get(country.slug)?.size ?? 0;

  const stats = [
    { label: "Route guides", value: programs.length },
    {
      label: "Intents covered",
      value: `${intentsCovered} of ${INTENTS.length}`,
    },
    { label: "Sources cited", value: country.sources.length },
    { label: "Last reviewed", value: country.lastReviewed },
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

      {/* Masthead — the country mark sits behind the ink ground as a low-
          opacity anchor, not a photograph standing in for one. */}
      <div className="band-ink relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
        >
          <CountryMark countrySlug={country.slug} label="" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-14">
          <nav aria-label="Breadcrumb" className="hero-enter hero-enter-1">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-sm text-on-brand/70">
              <li className="flex items-center gap-2">
                <Link
                  href="/destinations"
                  className="text-on-brand/70 underline underline-offset-4 hover:text-on-brand
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand"
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

          <h1 className="hero-enter hero-enter-2 t-page-title mt-8 text-on-brand">
            {country.name}
          </h1>
          <p className="hero-enter hero-enter-3 t-body mt-6 max-w-[68ch] text-on-brand opacity-85">
            {country.summary}
          </p>

          {/* Stat rail along the masthead's bottom edge. */}
          <dl className="hero-enter hero-enter-4 mt-12 grid grid-cols-2 divide-y divide-on-brand/15 border-t border-on-brand/15 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="py-4 sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <dt className="font-ui text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-on-brand/60">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-data text-xl tabular-nums text-on-brand">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* At a glance — one object, three compartments. */}
      <div className="mx-auto w-full max-w-6xl px-5">
        <dl className="grid divide-y divide-rule border-b border-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {glance.map((entry) => (
            <div
              key={entry.label}
              className="py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0"
            >
              <dt className="t-eyebrow">{entry.label}</dt>
              <dd className="mt-3 font-ui text-[1.0625rem] text-label [overflow-wrap:anywhere]">
                <FieldValue value={entry.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {newsUpdates.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-5 pt-16">
          <LatestUpdates updates={newsUpdates} />
        </div>
      ) : null}

      {/* 2. Intents — identical treatment to the home page. */}
      <section
        aria-labelledby="intents"
        className="mx-auto w-full max-w-6xl px-5 pt-16"
      >
        <SectionHeading id="intents" eyebrow="By intent">
          What do you want to do here?
        </SectionHeading>
        <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mx-auto w-full max-w-6xl px-5 pt-20">
        <SoftBridge country={country.slug} />
      </div>

      {problems.length > 0 ? (
        <section
          aria-labelledby="problems"
          className="mx-auto w-full max-w-6xl px-5 pt-16"
        >
          <SectionHeading id="problems" eyebrow="Start here">
            What usually goes wrong
          </SectionHeading>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* 3. All programs — the six intent hues do real navigational work here. */}
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
              caption={`Every route Vistolane covers for ${country.name}: ${programs.length} route${programs.length === 1 ? "" : "s"}, coloured by intent.`}
              columns={[
                { key: "name", label: "Route", width: "24%" },
                { key: "intent", label: "Intent", width: "14%", nowrap: true },
                {
                  key: "processingTime",
                  label: "Processing time",
                  width: "22%",
                  mono: true,
                },
                { key: "validity", label: "Validity" },
              ]}
              rows={programs.map((program) => ({
                rowAccent: `var(${tokenForIntent.get(program.intent)})`,
                name: (
                  <Link
                    href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                    className="font-ui font-semibold link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {program.name}
                  </Link>
                ),
                intent: (
                  <Badge tone={program.intent}>
                    {labelForIntent.get(program.intent) ?? program.intent}
                  </Badge>
                ),
                processingTime: <SummaryValue value={program.processingTime} />,
                validity: <SummaryValue value={program.validity} />,
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
        ) : (
          <div className="mt-6 rounded-card border border-separator bg-surface p-8">
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
                    className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
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
              caption={`Documents that apply across every route in ${country.name}, not only one.`}
              columns={[
                { key: "name", label: "Document", width: "30%" },
                { key: "note", label: "Note" },
              ]}
              rows={country.commonDocuments.map((document) => ({
                name: (
                  <span className="font-ui font-semibold text-label">
                    {document.name}
                  </span>
                ),
                note: document.note ? (
                  <span className="font-read">
                    <FieldValue value={document.note} />
                  </span>
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {living.map((entry) => (
            <div key={entry.label} className="band-inset rounded-card p-5">
              <LivingIcon name={entry.icon} />
              <p className="t-eyebrow mt-4">{entry.label}</p>
              <p className="mt-2 font-read text-label">
                <FieldValue value={entry.value} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Sources and review, set back on the inset band */}
      <section aria-labelledby="sources" className="band-inset mt-20">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading id="sources" eyebrow="Provenance">
            Sources
          </SectionHeading>
          <div className="mt-8">
            <ProvenancePanel sources={country.sources} />
          </div>
          <div className="mt-10">
            <ReviewerCredit
              author={country.author}
              lastReviewed={country.lastReviewed}
            />
          </div>
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
                coveredIntents={[
                  ...(intentsByCountry.get(candidate.slug) ?? []),
                ]}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
