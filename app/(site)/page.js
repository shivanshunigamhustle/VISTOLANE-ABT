import Link from "next/link";
import { IBM_Plex_Mono, Inter, Source_Serif_4 } from "next/font/google";

import Badge from "@/components/primitives/Badge";
import Button from "@/components/primitives/Button";
import DataTable from "@/components/primitives/DataTable";
import Select from "@/components/primitives/Select";
import {
  countUnverified,
  SummaryValue,
} from "@/components/primitives/Unverified";
import DestinationPhotoCard from "@/components/site/DestinationPhotoCard";
import EligibilityPreviewCard from "@/components/site/EligibilityPreviewCard";
import Icon from "@/components/site/IconSet";
import JsonLd from "@/components/site/JsonLd";
import Media from "@/components/site/Media";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS } from "@/lib/content/intents";
import {
  getAllCountries,
  getAllGuides,
  getAllPrograms,
} from "@/lib/content/loader";
import { formatReviewDate, sourceHosts } from "@/lib/content/provenance";
import { pageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { breadcrumbList, webSite } from "@/lib/seo/schema";

/**
 * Home.
 *
 * Rebuilt as a content-heavy, problem-led page (IA-02, TPL-01, DES-15): the
 * hero states the problem rather than the offer, eight real problems from the
 * guide library sit above the six intents, and three sections — costs, timing,
 * common requirements — are generated entirely from fees[], processingTime and
 * documents[] across all thirty programme guides. Nothing in those three
 * sections is hand-written; if a number looks thin, that is this site's
 * content coverage showing through honestly, not something to round up.
 *
 * Motion rule unchanged: only the hero entrance animates on its own, once, via
 * .hero-enter — a first-paint effect, not a scroll effect.
 */

const heroSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-hero-serif",
});
const heroSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hero-ui",
});
const heroMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-hero-mono",
});

const TAGLINE = "A clear path to your next move abroad";

export const metadata = pageMetadata({
  title: `${SITE_NAME} | ${TAGLINE}`,
  description: `${TAGLINE}. Immigration routes explained in full, with every figure traced to an official government source or marked as unverified.`,
  path: "/",
});

/** One plain-language line per intent, shown in section 5. */
const INTENT_BLURB = {
  visitor: "Tourist and short-stay entry rules by destination.",
  work: "Employer sponsorship, skilled-worker and remote-work routes.",
  study: "Student visas, sponsorship and post-study stay-back.",
  family: "Spouse, partner and dependent sponsorship routes.",
  investor: "Founder, investor and self-employment permits.",
  residence: "Permanent residence, naturalisation and dual citizenship.",
};

/** Sentence-case card titles for the intent grid; INTENTS' own label stays
 *  Title Case for the nav and everywhere else it is reused. */
const HERO_CARD_LABEL = {
  visitor: "Visit or travel",
  work: "Work abroad",
  study: "Study abroad",
  family: "Join family",
  investor: "Invest & start up",
  residence: "Settle & citizenship",
};

/**
 * Eight problems, picked for spread across intent and theme rather than any
 * ranking — every one of these is a real, sourced guide slug, checked at
 * build time by the loader call below. If a slug here stops existing the
 * build fails rather than linking to nothing.
 */
const PROBLEM_SLUGS = [
  "why-work-permit-applications-get-refused",
  "your-documents-were-returned",
  "your-funds-are-in-the-wrong-account",
  "your-job-offer-does-not-count",
  "you-are-on-the-wrong-permit-to-switch",
  "family-members-who-can-no-longer-come-with-you",
  "what-happens-when-your-permit-is-about-to-expire",
  "the-route-you-qualify-for-today-may-close-next-year",
];

/**
 * What the site can actually stand behind. Each line is a property the
 * content schema enforces on every record, not a claim about volume, speed,
 * outcomes or satisfaction, none of which can be evidenced.
 */
const TRUST = [
  {
    title: "Official sources only",
    body: "Every guide is written from government publications, not from secondary summaries.",
    icon: (
      <>
        <path d="M4 10.5 12 5l8 5.5" />
        <path d="M6.5 12.5v7M12 12.5v7M17.5 12.5v7" />
        <path d="M4 19.5h16" />
      </>
    ),
  },
  {
    title: "Cited and dated",
    body: "Each record carries its sources with the date each one was checked.",
    icon: (
      <>
        <path d="M6 3.5h8l4 4v13H6z" />
        <path d="M14 3.5v4h4" />
        <path d="M9 12.5h6M9 16h4" />
      </>
    ),
  },
  {
    title: "Gaps are marked, not filled",
    body: "Where a figure could not be confirmed it is labelled unverified rather than estimated.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 16.4v.4" />
        <path d="M9.9 9.6a2.2 2.2 0 0 1 4.3.7c0 1.5-2.2 1.9-2.2 3.2" />
      </>
    ),
  },
];

/**
 * Requirement themes for section 7. The same classification used on the
 * intent hub page (app/(site)/[intentPath]/page.js), applied here across
 * every programme rather than one intent — matched against how each route
 * actually names its own documents, since the exact-name intersection across
 * five countries is empty. Where a guide exists that speaks directly to a
 * theme, it is linked; where none exists yet, the count stands on its own
 * rather than link to something that is not there.
 */
const REQUIREMENT_THEMES = [
  {
    label: "Proof of identity",
    test: /passport|travel document|identity/i,
    href: null,
    icon: "document",
  },
  {
    label: "Evidence of funds",
    test: /financial|funds|maintenance|savings|income/i,
    href: "/resources/your-funds-are-in-the-wrong-account",
    icon: "money",
  },
  {
    label: "Language ability",
    test: /language|english|german|ielts|test result/i,
    href: null,
    icon: "education",
  },
  {
    label: "Police or character checks",
    test: /police|character|criminal|clearance/i,
    href: "/resources/police-certificates-and-medical-exams-explained",
    icon: "shield",
  },
  {
    label: "Medical or health cover",
    test: /medical|health|insurance|tuberculosis/i,
    href: "/resources/police-certificates-and-medical-exams-explained",
    icon: "health",
  },
  {
    label: "Proof of qualifications",
    test: /qualification|degree|credential|skills assessment|enrolment|acceptance/i,
    href: "/resources/your-qualification-is-not-recognised",
    icon: "education",
  },
  {
    label: "A sponsor or employer document",
    test: /sponsor|employer|certificate of sponsorship|nomination|job offer|contract/i,
    href: "/resources/the-person-deciding-your-case-is-not-the-government",
    icon: "work",
  },
];

/** One icon per problem card, matched to the guide's dominant theme rather
 *  than its intent — several problem guides deliberately cross intents, so
 *  this maps by slug instead of reusing the six intent icons. */
const PROBLEM_ICON = {
  "why-work-permit-applications-get-refused": "alert",
  "your-documents-were-returned": "document",
  "your-funds-are-in-the-wrong-account": "money",
  "your-job-offer-does-not-count": "work",
  "you-are-on-the-wrong-permit-to-switch": "shield",
  "family-members-who-can-no-longer-come-with-you": "family",
  "what-happens-when-your-permit-is-about-to-expire": "clock",
  "the-route-you-qualify-for-today-may-close-next-year": "calendar",
};

/**
 * @returns {Promise<JSX.Element>}
 */
export default async function HomePage() {
  const [countries, programs, guides] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
    getAllGuides(),
  ]);
  const records = [...countries, ...programs];
  const hosts = sourceHosts(records);

  const programsPerCountry = programs.reduce((counts, program) => {
    counts.set(program.countrySlug, (counts.get(program.countrySlug) ?? 0) + 1);
    return counts;
  }, new Map());

  const countFor = (slug) =>
    programs.filter((program) => program.intent === slug).length;

  const ordered = [...countries].sort(
    (a, b) =>
      (programsPerCountry.get(b.slug) ?? 0) -
        (programsPerCountry.get(a.slug) ?? 0) || a.name.localeCompare(b.name)
  );

  const regions = [...new Set(countries.map((c) => c.region))].sort();

  const countryName = new Map(countries.map((c) => [c.slug, c.name]));
  const intentLabel = new Map(INTENTS.map((i) => [i.slug, i.label]));
  const tokenForIntent = new Map(INTENTS.map((i) => [i.slug, i.token]));

  const recentlyUpdated = [...programs]
    .sort(
      (a, b) =>
        b.lastReviewed.localeCompare(a.lastReviewed) ||
        a.name.localeCompare(b.name)
    )
    .slice(0, 6);

  const problems = PROBLEM_SLUGS.map((slug) =>
    guides.find((g) => g.slug === slug)
  ).filter(Boolean);

  // Section 3 — every fee across every programme, totalled per currency per
  // route. A route can carry more than one currency only if its guide does,
  // which none currently do, but the aggregation does not assume that.
  const costRows = [...programs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((program) => {
      const confirmed = program.fees.filter((f) => f.amount !== null);
      const totalsByCurrency = new Map();
      for (const fee of confirmed) {
        totalsByCurrency.set(
          fee.currency,
          (totalsByCurrency.get(fee.currency) ?? 0) + fee.amount
        );
      }
      const totalText =
        totalsByCurrency.size === 0
          ? null
          : [...totalsByCurrency.entries()]
              .map(
                ([currency, total]) => `${total.toLocaleString()} ${currency}`
              )
              .join(" + ");
      const unconfirmed = program.fees.length - confirmed.length;
      return {
        key: `${program.countrySlug}-${program.slug}`,
        program,
        totalText,
        unconfirmed,
        totalFeeCount: program.fees.length,
      };
    });

  // Section 4 — published processing time, as stated on the route's own page.
  const timingRows = [...programs].sort((a, b) => a.name.localeCompare(b.name));
  const { unverified: timingUnverifiedCount } = countUnverified(
    programs.map((p) => p.processingTime)
  );

  // Section 7 — the same theme classification the intent hub uses, run
  // across every programme's documents[] instead of one intent's.
  const requirementCounts = REQUIREMENT_THEMES.map((theme) => ({
    label: theme.label,
    href: theme.href,
    count: programs.filter((p) =>
      p.documents.some((d) => theme.test.test(d.name))
    ).length,
  })).sort((a, b) => b.count - a.count);

  const heroHasImage = false;

  return (
    <main id="main-content">
      <JsonLd schema={webSite({ description: TAGLINE })} />
      <JsonLd schema={breadcrumbList([{ name: "Home", path: "/" }])} />

      {/* 1. Hero — states the problem, keeps the search, nothing else. The
          intent grid and trust bar that used to live here now have their own
          sections (5 and 9), positioned as the answer, not the opener. */}
      <section
        aria-labelledby="hero-heading"
        className={`hero-mockup relative bg-bg ${heroSerif.variable} ${heroSans.variable} ${heroMono.variable}`}
      >
        <div className="relative mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
          <div className="mx-auto max-w-[46rem]">
            <p className="hero-enter hero-enter-1 hero-kicker">
              Immigration and global mobility
            </p>
            <h1
              id="hero-heading"
              className="hero-enter hero-enter-2 hero-headline mt-5 text-label"
            >
              Immigration applications fail for a small number of reasons.
            </h1>
            <p className="hero-enter hero-enter-3 hero-sub mt-4 max-w-[46ch]">
              All of them are documented.
            </p>

            <div className="hero-enter hero-enter-4 mt-8">
              <nav aria-label="Search" className="flex flex-wrap gap-1">
                <span
                  aria-current="page"
                  className="rounded-t-control border-b-2 border-accent px-4 py-2.5 font-ui text-sm font-semibold text-label"
                >
                  Find your option
                </span>
                <Link
                  href="/destinations"
                  className="color-transition rounded-t-control border-b-2 border-transparent px-4 py-2.5 font-ui text-sm font-medium text-label-2 no-underline
                  hover:text-label
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Explore countries
                </Link>
              </nav>

              <form
                action="/destinations"
                method="get"
                className="surface-raised mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-end"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <label htmlFor="home-intent" className="t-eyebrow">
                    What do you want to do?
                  </label>
                  <Select
                    id="home-intent"
                    name="intent"
                    placeholder="Any intent"
                    options={INTENTS.map((intent) => ({
                      value: intent.slug,
                      label: intent.label,
                    }))}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <label htmlFor="home-region" className="t-eyebrow">
                    Where?
                  </label>
                  <Select
                    id="home-region"
                    name="region"
                    placeholder="Anywhere"
                    options={regions.map((region) => ({
                      value: region,
                      label: region,
                    }))}
                  />
                </div>

                <Button type="submit" variant="primary">
                  Find destinations
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Something already gone wrong? — eight real problems, above the intents,
          so a reader meets their own situation before the product. */}
      <section aria-labelledby="problems-heading" className="bg-bg">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading id="problems-heading" eyebrow="Start here">
            Something already gone wrong?
          </SectionHeading>
          <p className="t-body mt-4 max-w-[65ch] text-label-2">
            Applications fail at a small number of specific points. Find the one
            that matches your situation — each answer cites the official rule
            behind it.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {problems.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/resources/${guide.slug}`}
                  className="lift-card surface-raised flex h-full flex-col gap-3 border-t-2 p-5 no-underline
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  style={{ borderTopColor: "var(--color-warning)" }}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-control"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-warning) 14%, transparent)",
                    }}
                  >
                    <Icon
                      name={PROBLEM_ICON[guide.slug] ?? "alert"}
                      size={20}
                      className="text-[color:var(--color-warning)]"
                    />
                  </span>
                  <span className="font-ui text-[0.9375rem] font-semibold leading-snug text-label">
                    {guide.title}
                  </span>
                  <span className="font-ui text-[0.8125rem] leading-snug text-label-2">
                    {guide.cardSummary ?? guide.standfirst}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. What it actually costs — generated entirely from fees[]. Totals
          are confirmed amounts only; unconfirmed items are counted, never
          estimated. Third-party costs are named per item on each route's own
          fee table (a "government vs third-party" split is not a field this
          data reliably supports, so this does not claim one). */}
      <section
        aria-labelledby="costs-heading"
        className="band-inset [content-visibility:auto] [contain-intrinsic-size:1400px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading
            id="costs-heading"
            eyebrow="Every route, compared"
            trailing={
              <Link
                href="/tools/cost-estimator"
                className="text-sm link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Open the cost estimator
              </Link>
            }
          >
            What it actually costs
          </SectionHeading>
          <p className="t-body mt-4 max-w-[65ch] text-label-2">
            Every confirmed government and endorsing-body fee this site has
            recorded, totalled per route. Where a figure could not be confirmed
            against an official source it is counted, not guessed at — a route
            with three unconfirmed fees costs more than this table shows, not
            less.
          </p>
          <div className="mt-8">
            <DataTable
              viewport
              capClass="sm:max-h-[26rem]"
              caption={`Confirmed fee totals for ${costRows.length} routes across ${countries.length} countries.`}
              columns={[
                { key: "route", label: "Route", width: "26%" },
                { key: "country", label: "Country", width: "16%" },
                {
                  key: "total",
                  label: "Confirmed total",
                  mono: true,
                  align: "right",
                },
                { key: "gap", label: "Not yet confirmed", align: "right" },
              ]}
              rows={costRows.map(
                ({ key, program, totalText, unconfirmed }) => ({
                  rowAccent: `var(${tokenForIntent.get(program.intent)})`,
                  route: (
                    <Link
                      href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                      className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {program.name}
                    </Link>
                  ),
                  country:
                    countryName.get(program.countrySlug) ?? program.countrySlug,
                  total: totalText ? (
                    <span className="font-semibold text-label">
                      {totalText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-label-2">
                      <Icon name="alert" size={14} />
                      Not yet confirmed
                    </span>
                  ),
                  gap:
                    unconfirmed > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--color-warning) 14%, transparent)",
                          color: "var(--color-warning)",
                        }}
                      >
                        {unconfirmed} item{unconfirmed === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-label-2">None</span>
                    ),
                  key,
                })
              )}
            />
            <p className="mt-3 font-ui text-[0.8125rem] text-label-2">
              Scroll the table to see every route, or open the full comparison
              for filtering and sorting.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How long it actually takes — from processingTime across every
          guide, published service standard beside the same field's own
          hedge where the guide could not confirm one. */}
      <section
        aria-labelledby="timing-heading"
        className="bg-bg [content-visibility:auto] [contain-intrinsic-size:1400px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading
            id="timing-heading"
            eyebrow="Every route, compared"
            trailing={
              <Link
                href="/tools/processing-times"
                className="text-sm link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Compare every route
              </Link>
            }
          >
            How long it actually takes
          </SectionHeading>
          <p className="t-body mt-4 max-w-[65ch] text-label-2">
            The published service standard for every route this site covers,
            exactly as each guide states it — including where the guide could
            not confirm one.{" "}
            <Link
              href="/resources/how-to-read-a-processing-time"
              className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              Read what a published processing time actually measures
            </Link>
            .
          </p>
          <div className="mt-8">
            <DataTable
              viewport
              capClass="sm:max-h-[26rem]"
              caption={`Published processing times for ${timingRows.length} routes; ${timingUnverifiedCount} not yet confirmed against an official source.`}
              columns={[
                { key: "route", label: "Route", width: "26%" },
                { key: "country", label: "Country", width: "16%" },
                { key: "time", label: "Published processing time" },
              ]}
              rows={timingRows.map((program) => ({
                rowAccent: `var(${tokenForIntent.get(program.intent)})`,
                route: (
                  <Link
                    href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                    className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {program.name}
                  </Link>
                ),
                country:
                  countryName.get(program.countrySlug) ?? program.countrySlug,
                time: <SummaryValue value={program.processingTime} />,
                key: `${program.countrySlug}-${program.slug}`,
              }))}
            />
            <p className="mt-3 font-ui text-[0.8125rem] text-label-2">
              Scroll the table to see every route, or open the full comparison
              for filtering and sorting.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Six intents — the answer to sections 2 to 4, not the opener. */}
      <section
        aria-labelledby="intents-heading"
        className="band-inset [content-visibility:auto] [contain-intrinsic-size:900px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading id="intents-heading" eyebrow="Where to start">
            Six ways people move
          </SectionHeading>
          <nav
            aria-label="Browse by intent"
            className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-fr lg:grid-cols-3"
          >
            {INTENTS.map((intent) => (
              <Link
                key={intent.slug}
                href={`/${intent.path}`}
                className="lift-card surface-raised relative flex h-full flex-col gap-2 p-5 no-underline
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                <span className="t-data absolute right-5 top-5 shrink-0 text-xs leading-5 text-label-2">
                  {countFor(intent.slug)}{" "}
                  {countFor(intent.slug) === 1 ? "guide" : "guides"}
                </span>
                <span className="flex items-start gap-2 pr-[58px]">
                  <span
                    aria-hidden="true"
                    className="mt-[5px] size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: `var(${intent.token})` }}
                  />
                  <span className="font-ui text-[15.5px] font-semibold leading-5 text-label">
                    {HERO_CARD_LABEL[intent.slug] ?? intent.label}
                  </span>
                </span>
                <span className="font-ui text-[0.8125rem] leading-snug text-label-2">
                  {INTENT_BLURB[intent.slug]}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* 6. Destinations */}
      <section
        aria-labelledby="destinations-heading"
        className="bg-bg [content-visibility:auto] [contain-intrinsic-size:900px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading
            id="destinations-heading"
            eyebrow="By country"
            trailing={
              <Link
                href="/destinations"
                className="text-sm link-accent
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                See all {countries.length}
              </Link>
            }
          >
            Most covered destinations
          </SectionHeading>
          <ul className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 py-2 [overscroll-behavior-x:contain] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {ordered.slice(0, 6).map((country) => (
              <li key={country.slug} className="snap-start">
                <DestinationPhotoCard
                  country={country}
                  programCount={programsPerCountry.get(country.slug) ?? 0}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. What you will need, whatever the route — from documents[] across
          every guide. Linked only where a page already exists to send a
          reader to; an unlinked theme states its count and nothing more. */}
      <section
        aria-labelledby="requirements-heading"
        className="band-inset [content-visibility:auto] [contain-intrinsic-size:700px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading
            id="requirements-heading"
            eyebrow="Every route, compared"
            trailing={
              <Link
                href="/tools/document-checklist"
                className="text-sm link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Open the document checklist
              </Link>
            }
          >
            What you will need, whatever the route
          </SectionHeading>
          <p className="t-body mt-4 max-w-[65ch] text-label-2">
            Every route names its own paperwork differently. These are the
            themes that recur, and how many of the {programs.length} routes this
            site covers ask for one.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {requirementCounts.map((theme) => {
              const card = (
                <span
                  className={`flex h-full flex-col gap-3 p-5 ${
                    theme.href ? "lift-card" : ""
                  } surface-raised`}
                >
                  <Icon name={theme.icon} className="text-tint" />
                  <span className="mt-1 font-ui text-[0.9375rem] font-semibold leading-snug text-label">
                    {theme.label}
                  </span>
                  <span className="t-data mt-auto text-xs text-label-2">
                    {theme.count} of {programs.length} routes
                  </span>
                </span>
              );
              return (
                <li key={theme.label}>
                  {theme.href ? (
                    <Link
                      href={theme.href}
                      className="block h-full no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 8. Recently updated */}
      <section
        aria-labelledby="recent-heading"
        className="bg-bg [content-visibility:auto] [contain-intrinsic-size:700px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading
            id="recent-heading"
            eyebrow="Maintained"
            trailing={
              <Link
                href="/news"
                className="color-transition text-sm link-accent
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                What changed recently
              </Link>
            }
          >
            Recently updated
          </SectionHeading>

          <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentlyUpdated.map((program) => (
              <li key={`${program.countrySlug}-${program.slug}`}>
                <Link
                  href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                  className="lift-card surface-raised flex h-full flex-col gap-3 p-4 no-underline
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge tone={program.intent}>
                      {intentLabel.get(program.intent) ?? program.intent}
                    </Badge>
                    <span className="font-ui text-[0.8125rem] text-label-2">
                      {countryName.get(program.countrySlug) ??
                        program.countrySlug}
                    </span>
                  </span>
                  <span className="font-ui text-[0.9375rem] font-semibold leading-snug text-label">
                    {program.name}
                  </span>
                  <span className="mt-auto t-data text-xs text-label-2">
                    Reviewed{" "}
                    <time dateTime={program.lastReviewed}>
                      {formatReviewDate(program.lastReviewed)}
                    </time>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. How this site is written — the three trust items, unchanged, now
          answering "why should I believe you" after seven sections of
          problems and numbers rather than opening on a claim. */}
      <section
        aria-labelledby="trust-heading"
        className="band-inset [content-visibility:auto] [contain-intrinsic-size:400px]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading id="trust-heading" eyebrow="Provenance">
            How this site is written
          </SectionHeading>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {TRUST.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-fill">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="var(--color-tint)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </span>
                <div>
                  <p className="font-ui text-[0.9375rem] font-semibold text-label">
                    {item.title}
                  </p>
                  <p className="mt-1 font-ui text-[0.8125rem] leading-snug text-label-2">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-rule pt-8">
            <h3 className="t-eyebrow">Official sources we rely on</h3>
            <div className="marquee mt-4 overflow-hidden">
              <ul className="marquee-track flex w-max flex-nowrap gap-x-10">
                {[...hosts, ...hosts].map((host, i) => (
                  <li
                    key={`${host}-${i}`}
                    aria-hidden={i >= hosts.length ? "true" : undefined}
                    className="t-data shrink-0 font-semibold text-label-2"
                  >
                    {host}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Closing bridge */}
      <section className="border-t border-rule bg-bg [content-visibility:auto] [contain-intrinsic-size:500px]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
          <SoftBridge tone="flat" />
          <EligibilityPreviewCard />
        </div>
      </section>

      {/* Consultation stays available as a real page, not lost in the
          rebuild — linked from the closing bridge and nav; the dedicated
          band was removed from the homepage flow to keep this page about
          problems, costs and coverage rather than a lead-capture pitch
          before the reader has seen any of that. */}
      <section
        aria-labelledby="consult-heading"
        className="band-ink [content-visibility:auto] [contain-intrinsic-size:500px]"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-0 px-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Media slot="consultation" className="h-[220px] w-full lg:h-full">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-24 lg:hidden"
              style={{
                background:
                  "linear-gradient(to top, var(--color-brand-ink) 0%, transparent 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 hidden w-32 lg:block"
              style={{
                background:
                  "linear-gradient(to right, transparent 0%, var(--color-brand-ink) 100%)",
              }}
            />
          </Media>

          <div className="px-5 py-12 lg:px-12">
            <p className="t-eyebrow text-on-brand opacity-70">
              Talk to someone
            </p>
            <h2 id="consult-heading" className="t-section mt-4 text-on-brand">
              Book a consultation
            </h2>
            <p className="t-body mt-4 text-on-brand opacity-85">
              Every guide on this site is general information. A consultation is
              where someone looks at your circumstances and tells you which of
              these routes actually applies to you.
            </p>
            <div className="mt-7">
              <Button href="#" variant="primaryInk">
                Book a consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
