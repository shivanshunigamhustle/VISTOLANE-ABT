import Link from "next/link";
import { notFound } from "next/navigation";

import Badge from "@/components/primitives/Badge";
import DataTable from "@/components/primitives/DataTable";
import {
  countUnverified,
  FieldValue,
  SummaryValue,
} from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS, getIntentByPath } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllGuides,
  getAllTerms,
  getPrograms,
} from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * A global intent hub — one intent, compared across every country.
 *
 * A rankable landing page from data the loader already returns: no content
 * type is added for this, it is a view over Country and Program. The three
 * intents with no programme anywhere still render a real page rather than a
 * 404 — an honest "not covered yet", naming which countries would carry it,
 * is worth more to a reader (and to search) than an absent page.
 *
 * The standfirst is the only written copy on this page. Everything else —
 * the shared requirements, the differences, the glossary row, the guides — is
 * derived from records the loader already returns, so it cannot drift out of
 * step with the content and nothing here is asserted that the data does not
 * already say.
 *
 * Routed as app/(site)/[intentPath]/page.js — a single dynamic segment,
 * because Next.js resolves the sibling literal directories (/business,
 * /destinations, /tools, and so on) before falling through to this one, so
 * the six real paths and the fixed site routes never collide.
 */

/**
 * What each route type is for. Editorial, deliberately short, and making no
 * claim about any particular country's rules — the tables below do that.
 *
 * @type {Record<string, string>}
 */
const STANDFIRST = {
  visitor:
    "Short stays for tourism, family visits and business trips. These routes do not lead to residence on their own, and they are the ones most often refused for reasons that have nothing to do with the trip itself.",
  work: "Routes that require a job, and usually an employer willing to sponsor it. The employer's obligations are often the harder half, and they decide the timeline more than the worker's own application does.",
  study:
    "Permits tied to an institution and a course. What the qualification is worth afterwards depends on choices made before enrolment, which is why the study route is really a decision about the years following it.",
  family:
    "Joining a partner, parent or child who is already settled. These routes turn on documenting a relationship and meeting a financial threshold, and both are assessed more strictly than applicants expect.",
  investor:
    "Investment, start-up and business routes. They trade capital or a viable business plan for residence, and they carry the most conditions after approval of any route type here.",
  residence:
    "Permanent residence and the path to citizenship. Usually reached after years on another route rather than applied for directly, so the sequence that got someone here matters as much as the application itself.",
};

/**
 * The buyer persona each intent hub speaks to, named rather than left
 * implicit. Every fact this page states already comes from real programme
 * records — this only puts a name on who those facts are for, the same way
 * a product page names its audience before it lists features.
 *
 * @type {Record<string, string>}
 */
const PERSONA = {
  visitor: "The Short-Stay Visitor",
  work: "The Sponsored Worker",
  study: "The International Student",
  family: "The Family Sponsor",
  investor: "The Investor & Founder",
  residence: "The Long-Term Settler",
};

/**
 * @returns {Array<{ intentPath: string }>}
 */
export function generateStaticParams() {
  return INTENTS.map((intent) => ({ intentPath: intent.path }));
}

/**
 * @param {{ params: Promise<{ intentPath: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { intentPath } = await params;
  const intent = getIntentByPath(intentPath);
  if (!intent) return {};

  return pageMetadata({
    title: `${intent.label} | Vistolane`,
    description: `${intent.label} routes compared across every country Vistolane covers.`,
    path: `/${intent.path}`,
  });
}

/**
 * @param {{ params: Promise<{ intentPath: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function IntentHubPage({ params }) {
  const { intentPath } = await params;
  const intent = getIntentByPath(intentPath);
  if (!intent) notFound();

  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getPrograms({ intent: intent.slug }),
  ]);

  const countryName = new Map(countries.map((c) => [c.slug, c.name]));
  const coveringSlugs = new Set(programs.map((p) => p.countrySlug));
  const covering = countries.filter((c) => coveringSlugs.has(c.slug));
  const notCovering = countries.filter((c) => !coveringSlugs.has(c.slug));

  const otherIntents = INTENTS.filter((i) => i.slug !== intent.slug);

  const [allTerms, allGuides] = await Promise.all([
    getAllTerms(),
    getAllGuides(),
  ]);

  const programSlugs = new Set(programs.map((p) => p.slug));

  /*
   * Requirements that recur across these routes.
   *
   * Matching on the document NAME does not work: each country names its own
   * paperwork, so the exact-name intersection across five countries is empty
   * and the best overlap anywhere is two of five. What does hold is the theme —
   * every one of these systems asks for identity, money and a clean record,
   * under different names. So the themes are matched against how each country
   * words it, and each is reported with its real count rather than as a
   * universal.
   */
  const THEMES = [
    { label: "Proof of identity", test: /passport|travel document|identity/i },
    {
      label: "Evidence of funds",
      test: /financial|funds|maintenance|savings|income/i,
    },
    {
      label: "Language ability",
      test: /language|english|german|ielts|test result/i,
    },
    {
      label: "Police or character checks",
      test: /police|character|criminal|clearance/i,
    },
    {
      label: "Medical or health cover",
      test: /medical|health|insurance|tuberculosis/i,
    },
    {
      label: "Proof of qualifications",
      test: /qualification|degree|credential|skills assessment|enrolment|acceptance/i,
    },
    {
      label: "A sponsor or employer document",
      test: /sponsor|employer|certificate of sponsorship|nomination|job offer|contract/i,
    },
  ];
  const recurring = THEMES.map((theme) => ({
    label: theme.label,
    count: programs.filter((p) =>
      p.documents.some((d) => theme.test.test(d.name))
    ).length,
  }))
    .filter((t) => t.count >= 2)
    .sort((a, b) => b.count - a.count);

  // How they differ, stated only from fields that carry a definite value.
  const extendable = programs.filter((p) => p.extendable).length;
  const quotaed = programs.filter((p) => p.quotas).length;
  const differences = [];
  if (programs.length > 1 && extendable > 0 && extendable < programs.length) {
    differences.push(
      `${extendable} of ${programs.length} can be extended; the rest cannot, so the first grant is the whole of the stay.`
    );
  } else if (programs.length > 1 && extendable === programs.length) {
    differences.push(
      `All ${programs.length} can be extended, so the first grant is a starting point rather than a ceiling.`
    );
  }
  if (quotaed > 0) {
    differences.push(
      `${quotaed} of ${programs.length} ${quotaed === 1 ? "carries a cap or quota" : "carry a cap or quota"}, which can close a route mid-year regardless of how strong an application is.`
    );
  }

  // Glossary terms are linked to programmes, so the terms for this intent are
  // the ones whose related programmes sit inside it.
  const terms = allTerms
    .filter((t) => (t.relatedPrograms ?? []).some((s) => programSlugs.has(s)))
    .slice(0, 12);

  const guides = allGuides.filter((g) => g.intent === intent.slug);

  // Problem-library guides matched to this intent by relatedPrograms, the
  // same way the individual programme page's "wider pattern" panel matches —
  // most problem guides carry intent: null since they deliberately cross
  // intents, so matching on intent.slug alone (as `guides` above does) would
  // miss almost all of them.
  const problems = allGuides
    .filter((g) => (g.relatedPrograms ?? []).some((s) => programSlugs.has(s)))
    .slice(0, 4);

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: intent.label, path: `/${intent.path}` },
        ])}
      />

      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <p className="t-eyebrow text-on-brand opacity-70">By intent</p>
          <h1 className="t-page-title mt-6 text-on-brand">{intent.label}</h1>
          <p className="mt-4">
            <Badge tone={intent.slug} onInk>
              Persona: {PERSONA[intent.slug]}
            </Badge>
          </p>
          <p className="t-lede mt-5 max-w-[60ch] text-on-brand opacity-85">
            {STANDFIRST[intent.slug]}
          </p>
          <p className="mt-4 font-ui text-[0.9375rem] text-on-brand opacity-70">
            Compared across {countries.length}{" "}
            {countries.length === 1 ? "country" : "countries"}.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="Compare">
          {intent.label} across every country
        </SectionHeading>

        {programs.length === 0 ? (
          <div className="surface-raised mt-8 p-8">
            <h2 className="t-section text-label">
              No {intent.label.toLowerCase()} routes are written yet
            </h2>
            <p className="t-body mt-4 max-w-[60ch] text-label">
              This intent is not covered for any country yet. It would sit
              under: {countries.map((c) => c.name).join(", ")}, as those are
              written.
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <DataTable
              caption={`${programs.length} route${programs.length === 1 ? "" : "s"}`}
              columns={[
                { key: "program", label: "Route", width: "32%" },
                { key: "country", label: "Country", width: "20%" },
                { key: "processingTime", label: "Processing time" },
                { key: "validity", label: "Validity" },
              ]}
              rows={programs.map((program) => ({
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
        )}
      </div>

      {problems.length > 0 ? (
        <div className="band-inset">
          <div className="mx-auto w-full max-w-6xl px-5 py-12">
            <SectionHeading eyebrow="Start here">
              What usually goes wrong
            </SectionHeading>
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
          </div>
        </div>
      ) : null}

      {programs.length > 0 &&
      (recurring.length > 0 || differences.length > 0) ? (
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-12 md:grid-cols-2">
          {recurring.length > 0 ? (
            <section aria-labelledby="common-heading">
              <SectionHeading id="common-heading" eyebrow="Essentials">
                What {PERSONA[intent.slug]} needs, everywhere
              </SectionHeading>
              <p className="t-body mt-6 text-label-2">
                Each country names its paperwork differently. These are the
                requirements that recur, and how many of the {programs.length}{" "}
                routes ask for one:
              </p>
              <ul className="mt-4 space-y-2">
                {recurring.map((theme) => (
                  <li
                    key={theme.label}
                    className="flex items-baseline justify-between gap-4 border-b border-rule pb-2 font-ui text-[0.9375rem] text-label"
                  >
                    {theme.label}
                    <span className="t-data shrink-0 text-label-2">
                      {theme.count} of {programs.length}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {differences.length > 0 ? (
            <section aria-labelledby="differ-heading">
              <SectionHeading id="differ-heading" eyebrow="Variance">
                How the countries differ
              </SectionHeading>
              <ul className="mt-6 space-y-3">
                {differences.map((line) => (
                  <li key={line} className="t-body text-label">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {terms.length > 0 || guides.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-5 pb-12">
          {guides.length > 0 ? (
            <section aria-labelledby="guides-heading" className="mb-10">
              <SectionHeading id="guides-heading" eyebrow="Reading">
                Guides on {intent.label.toLowerCase()}
              </SectionHeading>
              <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/resources/${guide.slug}`}
                      className="lift-card surface-raised flex h-full flex-col gap-2 p-4 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
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

          {terms.length > 0 ? (
            <section aria-labelledby="terms-heading">
              <SectionHeading id="terms-heading" eyebrow="Vocabulary">
                Terms that come up
              </SectionHeading>
              <ul className="mt-6 flex flex-wrap gap-2">
                {terms.map((term) => (
                  <li key={term.slug}>
                    <Link
                      href={`/glossary/${term.slug}`}
                      className="color-transition inline-flex rounded-pill border border-rule px-3 py-1.5 font-ui text-sm text-label no-underline hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {term.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading eyebrow="Coverage">Where this applies</SectionHeading>

          {covering.length > 0 ? (
            // Below sm, an odd or growing country count always leaves the
            // last grid row short and lopsided, so cards scroll horizontally
            // instead — a fixed card width plus snap, never full-bleed (it
            // stays inside the same max-w-6xl/px-5 gutter as everything
            // else). From sm up there is room for a real grid, and every row
            // fills evenly enough that a short last row reads fine there.
            <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
              {covering.map((country) => (
                <li
                  key={country.slug}
                  className="w-[220px] shrink-0 snap-start sm:w-auto"
                >
                  <Link
                    href={`/destinations/${country.slug}/${intent.slug}`}
                    className="lift-card surface-raised block p-5 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    <h3 className="t-subsection text-label">{country.name}</h3>
                    <p className="mt-1 font-ui text-sm text-label-2">
                      {
                        programs.filter((p) => p.countrySlug === country.slug)
                          .length
                      }{" "}
                      route
                      {programs.filter((p) => p.countrySlug === country.slug)
                        .length === 1
                        ? ""
                        : "s"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {notCovering.length > 0 ? (
            <div className="mt-8">
              <h3 className="t-eyebrow mb-3">Not covered yet</h3>
              <ul className="flex flex-wrap gap-3">
                {notCovering.map((country) => (
                  <li key={country.slug}>
                    <Link
                      href={`/destinations/${country.slug}`}
                      className="color-transition inline-flex items-center rounded-pill border border-separator bg-transparent px-3 py-1.5 text-sm text-label-2 no-underline hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {country.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <SoftBridge intent={intent.slug} intentLabel={intent.label} />
      </div>

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <h2 className="t-eyebrow mb-4">Related intents</h2>
          <div className="marquee overflow-hidden">
            <ul className="marquee-track flex w-max flex-nowrap gap-3">
              {[...otherIntents, ...otherIntents].map((other, i) => {
                const duplicate = i >= otherIntents.length;
                return (
                  <li key={`${other.slug}-${i}`} className="shrink-0">
                    <Link
                      href={`/${other.path}`}
                      aria-hidden={duplicate ? "true" : undefined}
                      tabIndex={duplicate ? -1 : undefined}
                      className="color-transition inline-flex items-center gap-2 rounded-pill border border-separator bg-surface px-3 py-1.5 text-sm text-label no-underline hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full"
                        style={{ backgroundColor: `var(${other.token})` }}
                      />
                      {other.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
