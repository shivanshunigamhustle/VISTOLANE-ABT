import Link from "next/link";

import Button from "@/components/primitives/Button";
import CountryCard from "@/components/site/CountryCard";
import IntentCard from "@/components/site/IntentCard";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS } from "@/lib/content/intents";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";
import { pageMetadata, SITE_NAME } from "@/lib/seo/metadata";
import { breadcrumbList, webSite } from "@/lib/seo/schema";

/**
 * Home.
 *
 * Section grounds alternate so the page has a rhythm rather than five identical
 * bands: ink, page ground, inset, page ground, inset, ink. The hero and the
 * closing bridge share the brand ground, which opens and closes the page on the
 * same note.
 *
 * Everything factual is counted from the loader. The only invented strings are
 * structural labels, the headline, and the trust placeholder — which says on its
 * face that it is one.
 *
 * TODO(content): a news / latest-updates section belongs between the trust block
 * and the soft bridge. It is omitted rather than stubbed because no NewsUpdate
 * content exists yet, and an empty carousel reads worse than no carousel.
 */

/** The application's own tagline. */
const TAGLINE = "A clear path to your next move abroad";

export const metadata = pageMetadata({
  title: `${SITE_NAME} — ${TAGLINE}`,
  description: `${TAGLINE}. Immigration routes explained in full, with every figure traced to an official government source or marked as unverified.`,
  path: "/",
});

/**
 * @returns {Promise<JSX.Element>}
 */
export default async function HomePage() {
  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
  ]);

  const programsPerCountry = programs.reduce((counts, program) => {
    counts.set(program.countrySlug, (counts.get(program.countrySlug) ?? 0) + 1);
    return counts;
  }, new Map());

  const countFor = (intentSlug) =>
    programs.filter((program) => program.intent === intentSlug).length;

  // Countries that actually have guides come first, so the section never leads
  // with an empty destination.
  const ordered = [...countries].sort(
    (a, b) =>
      (programsPerCountry.get(b.slug) ?? 0) -
        (programsPerCountry.get(a.slug) ?? 0) || a.name.localeCompare(b.name)
  );

  const regions = [
    ...new Set(countries.map((country) => country.region)),
  ].sort();

  return (
    <main id="main-content">
      <JsonLd schema={webSite({ description: TAGLINE })} />
      <JsonLd schema={breadcrumbList([{ name: "Home", path: "/" }])} />

      {/* 1. Hero — the brand ground, and the whole first screen. */}
      <section aria-labelledby="hero-heading" className="band-ink">
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <p className="t-eyebrow text-on-brand opacity-70">
              Immigration and global mobility
            </p>

            <h1
              id="hero-heading"
              className="t-display mt-6 max-w-[16ch] text-on-brand"
            >
              Immigration routes, explained in full
            </h1>

            <p className="t-lede mt-7 max-w-[52ch] text-on-brand opacity-85">
              {TAGLINE}.
            </p>

            <hr className="mt-10 max-w-md border-0 border-t border-on-brand/25" />

            <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="t-data text-on-brand opacity-80">
                {countries.length}{" "}
                {countries.length === 1 ? "destination" : "destinations"} ·{" "}
                {programs.length} route{" "}
                {programs.length === 1 ? "guide" : "guides"}
              </span>
              <span className="font-ui text-[0.9375rem] text-on-brand opacity-70">
                Every figure sourced or marked unverified.
              </span>
            </p>
          </div>

          {/*
            The right column is an index, not decoration: the six intents with
            their real guide counts, each a link straight to its filtered view.
          */}
          <nav aria-label="Browse by intent" className="lg:pt-2">
            <p className="t-eyebrow text-on-brand opacity-70">
              Browse by intent
            </p>
            <ul className="mt-5 border-t border-on-brand/20">
              {INTENTS.map((intent) => {
                const count = countFor(intent.slug);
                return (
                  <li key={intent.slug} className="border-b border-on-brand/20">
                    <Link
                      href={`/destinations?intent=${intent.slug}`}
                      className="flex items-baseline justify-between gap-4 py-3.5 no-underline
                        transition-opacity duration-200 motion-reduce:transition-none
                        hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand"
                    >
                      <span className="flex items-baseline gap-2.5">
                        <span
                          aria-hidden="true"
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: `var(${intent.token})` }}
                        />
                        <span className="font-ui text-[0.9375rem] text-on-brand">
                          {intent.label}
                        </span>
                      </span>
                      <span className="t-data shrink-0 text-on-brand opacity-70">
                        {count === 0 ? "—" : count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/*
            The white panel on the deep navy is the hero's whole visual idea.
            It is also a plain GET form: the search works with JavaScript off,
            because the destination grid already filters from searchParams.
          */}
          <form
            action="/destinations"
            method="get"
            className="surface-raised flex flex-col gap-5 p-6 sm:flex-row sm:items-end lg:col-span-2 lg:mt-4"
          >
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="home-intent" className="t-eyebrow">
                What do you want to do?
              </label>
              <select
                id="home-intent"
                name="intent"
                defaultValue=""
                className="w-full rounded-[var(--radius-control)] border border-rule bg-surface px-3 py-2.5 text-sm text-label
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
                className="w-full rounded-[var(--radius-control)] border border-rule bg-surface px-3 py-2.5 text-sm text-label
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
      </section>

      {/* 2. Audience fork — two blocks divided by a rule, not two cards. */}
      <section
        aria-labelledby="audience-heading"
        className="mx-auto w-full max-w-6xl px-5 py-24"
      >
        <SectionHeading id="audience-heading" eyebrow="Start here">
          Where do you fit?
        </SectionHeading>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:divide-x md:divide-rule">
          <div className="md:pr-10">
            <h3 className="t-subsection text-label">For Individuals</h3>
            <p className="t-body mt-3 text-label">
              Moving for work, study, family, investment or to settle. Start
              from what you want to do and see which routes fit.
            </p>
            <p className="mt-5">
              <Link
                href="/destinations"
                className="text-sm text-tint underline underline-offset-4
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                Browse destinations
              </Link>
            </p>
          </div>

          <div aria-disabled="true" className="md:pl-10">
            <h3 className="t-subsection flex flex-wrap items-center gap-3 text-label">
              For Business
              <span className="rounded-[var(--radius-control)] bg-fill px-1.5 py-0.5 font-ui text-[0.6875rem] font-medium text-label-2">
                Coming soon
              </span>
            </h3>
            <p className="t-body mt-3 text-label">
              Hiring global talent, posting roles and partnering with us. These
              pages are not written yet.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Intents — inset band. */}
      <section aria-labelledby="intents-heading" className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-24">
          <SectionHeading id="intents-heading" eyebrow="By intent">
            What do you want to do?
          </SectionHeading>
          <div className="mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INTENTS.map((intent) => (
              <IntentCard
                key={intent.slug}
                intent={intent}
                href={`/destinations?intent=${intent.slug}`}
                count={countFor(intent.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Destinations — raised cards on the page ground. */}
      <section
        aria-labelledby="destinations-heading"
        className="mx-auto w-full max-w-6xl px-5 py-24"
      >
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
          Destinations
        </SectionHeading>

        <div
          className={`mt-10 grid auto-rows-fr gap-5 sm:grid-cols-2 ${
            countries.length > 4 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {ordered.slice(0, 6).map((country) => (
            <CountryCard
              key={country.slug}
              country={country}
              programCount={programsPerCountry.get(country.slug) ?? 0}
            />
          ))}
        </div>
      </section>

      {/*
        TODO(content): verified trust content — testimonials with consent,
        metrics the client can evidence, and any certification or regulator
        registration they actually hold — is owed by the client. Nothing here may
        be replaced with an approximation: an unevidenced statistic on an
        immigration site is a legal exposure for them, not a design detail. A
        titled section holding one sentence read as a hole, so the sentence sits
        above the closing bridge until there is something real to fill a section.
      */}
      <section className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-20">
          <p className="border-b border-on-brand/20 pb-8 font-ui text-[0.9375rem] text-on-brand opacity-70">
            Verified testimonials, success metrics and regulator registrations
            are pending from the client. Nothing on this page is
            placeholder-filled in the meantime.
          </p>
          <div className="pt-12">
            <SoftBridge tone="ink" />
          </div>
        </div>
      </section>
    </main>
  );
}
