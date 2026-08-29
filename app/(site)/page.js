import Link from "next/link";

import Button from "@/components/primitives/Button";
import AttributedLink from "@/components/site/AttributedLink";
import DestinationPhotoCard from "@/components/site/DestinationPhotoCard";
import IntentCard from "@/components/site/IntentCard";
import JsonLd from "@/components/site/JsonLd";
import Media from "@/components/site/Media";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS } from "@/lib/content/intents";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";
import { sourceHosts } from "@/lib/content/provenance";
import { eligibilityPath } from "@/lib/bridge";
import { pageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { breadcrumbList, webSite } from "@/lib/seo/schema";

/**
 * Home.
 *
 * Stays statically prerendered: nothing here reads searchParams. The hero tabs
 * are links, not state — "Find your option" is the active state on this page and
 * "Explore countries" is a real link to /destinations, which already is the
 * country explorer. Two tabs, two URLs, no JavaScript, no dynamic deopt.
 *
 * Every factual line is counted or derived from the loader. The only invented
 * strings are structural labels and the intent descriptions.
 *
 * Motion rule: only the hero entrance animates on its own, once, via the
 * .hero-enter CSS classes — a first-paint effect, not a scroll effect. Every
 * other section is static until a reader presses or hovers something.
 */

const TAGLINE = "A clear path to your next move abroad";

export const metadata = pageMetadata({
  title: `${SITE_NAME} — ${TAGLINE}`,
  description: `${TAGLINE}. Immigration routes explained in full, with every figure traced to an official government source or marked as unverified.`,
  path: "/",
});

/** One plain-language line per intent. Structural copy, not a claim. */
const INTENT_BLURB = {
  visitor: "Short stays, tourism and family visits.",
  work: "Employer-sponsored routes and work permits.",
  study: "Student permits and what follows graduation.",
  family: "Joining a partner, parent or child.",
  investor: "Investment, start-up and business routes.",
  residence: "Permanent residence and citizenship.",
};

/**
 * What the site can actually stand behind, and nothing else. Each line is a
 * property the content schema enforces on every record — not a claim about
 * volume, speed, outcomes or satisfaction, none of which we can evidence.
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

/** Only tools that exist, plus the ones actually on the roadmap. */
const TOOLS = [
  {
    name: "Check your eligibility",
    body: "Answer a few questions and see which routes may fit. No account needed.",
    href: null,
    live: true,
  },
  {
    name: "Processing times",
    body: "Current published timescales for each route, side by side.",
    href: "/tools/processing-times",
    live: true,
  },
  {
    name: "Document checklist",
    body: "A per-route list of what to gather, and what each item must show.",
    href: "/tools/document-checklist",
    live: true,
  },
  {
    name: "Cost estimator",
    body: "Government fees and the third-party costs that sit alongside them.",
    href: "/tools/cost-estimator",
    live: true,
  },
];

/**
 * @returns {Promise<JSX.Element>}
 */
export default async function HomePage() {
  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
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

  // Both hero states are designed (an image bleeds to the edge behind a
  // fade, or the six-intent index fills the same space) but the client has
  // said explicitly, more than once, that the hero must never show a photo —
  // so this always takes the no-image branch regardless of whether hero.jpg
  // is configured in lib/media.js.
  const heroHasImage = false;

  return (
    <main id="main-content">
      <JsonLd schema={webSite({ description: TAGLINE })} />
      <JsonLd schema={breadcrumbList([{ name: "Home", path: "/" }])} />

      {/* 2. Hero */}
      <section aria-labelledby="hero-heading" className="relative bg-bg">
        {heroHasImage ? (
          <Media
            slot="hero"
            className="pointer-events-none !absolute inset-y-0 right-0 hidden w-[58%] lg:block"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, var(--color-bg) 0%, var(--color-bg) 20%, color-mix(in srgb, var(--color-bg) 60%, transparent) 45%, transparent 78%)",
              }}
            />
          </Media>
        ) : null}

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-14">
          <div
            className={heroHasImage ? "lg:max-w-[36rem]" : "lg:max-w-[42rem]"}
          >
            <p className="hero-enter hero-enter-1 t-eyebrow">
              Immigration and global mobility
            </p>
            <h1
              id="hero-heading"
              className="hero-enter hero-enter-2 t-display mt-5 text-label"
            >
              Immigration routes, explained in full
            </h1>
            <p className="hero-enter hero-enter-3 t-lede mt-6 max-w-[46ch]">
              {TAGLINE}.
            </p>
          </div>

          {heroHasImage ? (
            /* Photograph on small screens, where the absolute slot is hidden. */
            <Media
              slot="hero"
              className="mt-8 h-[380px] w-full rounded-media lg:hidden"
            />
          ) : (
            <nav
              aria-label="Browse by intent"
              className="mt-8 grid gap-2 sm:grid-cols-2 lg:max-w-[38rem]"
            >
              {INTENTS.map((intent) => (
                <Link
                  key={intent.slug}
                  href={`/${intent.path}`}
                  className="lift-card surface-raised flex items-center justify-between gap-3 p-4 no-underline
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: `var(${intent.token})` }}
                    />
                    <span className="font-ui text-sm font-medium text-label">
                      {intent.label}
                    </span>
                  </span>
                  <span className="t-data shrink-0 text-xs text-label-2">
                    {countFor(intent.slug)}{" "}
                    {countFor(intent.slug) === 1 ? "guide" : "guides"}
                  </span>
                </Link>
              ))}
            </nav>
          )}

          {/* Tabs are links. The active one is this page. */}
          <div className="hero-enter hero-enter-4 mt-10 lg:max-w-[42rem]">
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
              className="surface-raised flex flex-col gap-4 p-5 sm:flex-row sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="home-intent" className="t-eyebrow">
                  What do you want to do?
                </label>
                <select
                  id="home-intent"
                  name="intent"
                  defaultValue=""
                  className="w-full rounded-control border border-rule bg-surface px-3 py-2.5 text-sm text-label
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  <option value="">Any intent</option>
                  {INTENTS.map((intent) => (
                    <option key={intent.slug} value={intent.slug}>
                      {intent.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="home-region" className="t-eyebrow">
                  Where?
                </label>
                <select
                  id="home-region"
                  name="region"
                  defaultValue=""
                  className="w-full rounded-control border border-rule bg-surface px-3 py-2.5 text-sm text-label
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  <option value="">Anywhere</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="primary">
                Find destinations
              </Button>
            </form>
          </div>

          {/* 3. Trust bar — sits under the search, static. */}
          <h2 id="trust-heading" className="sr-only">
            How this site is written
          </h2>
          <ul
            aria-labelledby="trust-heading"
            className="mt-8 flex flex-wrap gap-x-8 gap-y-4 lg:max-w-[42rem]"
          >
            {TRUST.map((item) => (
              <li key={item.title} className="flex gap-2.5">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="var(--color-tint)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0"
                >
                  {item.icon}
                </svg>
                <div>
                  <p className="font-ui text-[0.8125rem] font-semibold text-label">
                    {item.title}
                  </p>
                  <p className="mt-0.5 font-ui text-[0.75rem] leading-snug text-label-2">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4. Intents */}
      <section aria-labelledby="intents-heading" className="bg-bg">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <SectionHeading id="intents-heading" eyebrow="By intent">
            Explore by what matters to you
          </SectionHeading>
          {/*
            Six across only where six fit. At max-w-6xl a 6-column row gives each
            card ~172px, which will not hold "Settle & Citizenship" beside a 28px
            icon — so it is 2 up on mobile, 3 from md, and 6 only at 2xl.
          */}
          <div className="mt-10 grid auto-rows-fr grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-6">
            {INTENTS.map((intent) => (
              <IntentCard
                key={intent.slug}
                intent={intent}
                href={`/${intent.path}`}
                count={countFor(intent.slug)}
                description={INTENT_BLURB[intent.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Destinations */}
      <section aria-labelledby="destinations-heading" className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <SectionHeading
            id="destinations-heading"
            eyebrow="By country"
            trailing={
              <Link
                href="/destinations"
                className="text-sm text-tint underline underline-offset-4
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                See all {countries.length}
              </Link>
            }
          >
            Most covered destinations
          </SectionHeading>
          {/*
            Ordered by how many guides exist, which is what the heading says.
            Horizontal scroll on mobile; the vertical padding keeps focus rings
            from being clipped by the scroll container.
          */}
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

      {/* 6. Tools */}
      <section aria-labelledby="tools-heading" className="bg-bg">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <SectionHeading id="tools-heading" eyebrow="Practical">
            Tools &amp; resources
          </SectionHeading>
          <ul className="mt-10 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <li key={tool.name} className="surface-raised flex flex-col p-5">
                <p className="font-ui text-[1.0625rem] font-semibold text-label">
                  {tool.name}
                </p>
                <p className="mt-2 flex-1 font-ui text-[0.875rem] leading-snug text-label-2">
                  {tool.body}
                </p>
                <p className="mt-4">
                  {tool.live && tool.href ? (
                    <Link
                      href={tool.href}
                      className="color-transition font-ui text-sm text-tint underline underline-offset-4
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      Open the tool
                    </Link>
                  ) : tool.live ? (
                    <AttributedLink
                      path={eligibilityPath() || undefined}
                      source="home-tools"
                      className="color-transition font-ui text-sm text-tint underline underline-offset-4
                        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      Open the checker
                    </AttributedLink>
                  ) : (
                    <span className="font-ui text-[0.8125rem] text-label-2">
                      In development
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Consultation */}
      <section aria-labelledby="consult-heading" className="band-ink">
        <div className="mx-auto grid w-full max-w-6xl gap-0 px-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Media slot="consultation" className="h-[260px] w-full lg:h-full" />

          <div className="px-5 py-16 lg:px-12">
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

            {/*
              TODO(content): success stories need testimonials supplied by the
              client with the consent of the people quoted. Nothing may be
              written here in the meantime — an invented outcome on an
              immigration site is a legal exposure, not filler.
            */}
            <div className="mt-10 rounded-card border border-dashed border-on-brand/35 p-5">
              <p className="font-ui text-[0.9375rem] font-semibold text-on-brand">
                Success stories
              </p>
              <p className="mt-2 font-ui text-[0.875rem] leading-snug text-on-brand opacity-75">
                Pending — awaiting testimonials the client can evidence, with
                the consent of the people quoted. Nothing is written here until
                then.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Sources */}
      <section
        aria-labelledby="sources-heading"
        className="border-t border-rule bg-surface"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <h2 id="sources-heading" className="t-eyebrow">
            Official sources we rely on
          </h2>
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
          <p className="mt-4 font-ui text-[0.8125rem] text-label-2">
            Every figure on a guide links to the page it came from, with the
            date it was checked.
          </p>
        </div>
      </section>

      {/* 9. Closing bridge */}
      <section className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <SoftBridge tone="ink" />
        </div>
      </section>
    </main>
  );
}
