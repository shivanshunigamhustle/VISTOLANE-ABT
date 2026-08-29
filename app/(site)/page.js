import Link from "next/link";

import Button from "@/components/primitives/Button";
import CountryCard from "@/components/site/CountryCard";
import IntentCard from "@/components/site/IntentCard";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS } from "@/lib/content/intents";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";

/**
 * Home.
 *
 * Everything factual on this page is counted from the loader. The only invented
 * strings are structural labels, the headline, and the trust placeholders — and
 * the placeholders say so on their face.
 *
 * TODO(content): a news / latest-updates section belongs between the trust block
 * and the soft bridge. It is omitted rather than stubbed because no NewsUpdate
 * content exists yet, and an empty carousel reads worse than no carousel.
 */

/** The application's own tagline. */
const TAGLINE = "A clear path to your next move abroad";

export const metadata = {
  title: "Vistolane",
  description: TAGLINE,
};

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

  // Countries that actually have guides come first; the rest follow, so the
  // section never leads with an empty destination.
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
      {/* 1. Hero */}
      <section
        aria-labelledby="hero-heading"
        className="border-b border-separator"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <h1
            id="hero-heading"
            className="max-w-[20ch] text-4xl font-semibold leading-tight sm:text-5xl"
          >
            Immigration routes, explained in full
          </h1>
          <p className="mt-5 max-w-[68ch] font-read text-xl leading-relaxed text-label-2">
            {TAGLINE}.
          </p>
          <p className="mt-4 max-w-[68ch] font-read leading-relaxed text-label-2">
            {countries.length}{" "}
            {countries.length === 1 ? "destination" : "destinations"} and{" "}
            {programs.length} route {programs.length === 1 ? "guide" : "guides"}{" "}
            so far. Every figure is either traced to an official government
            source or marked on the page as unverified.
          </p>

          {/*
            Plain GET form. It submits to the destination grid, which already
            filters from searchParams, so the whole search works with JavaScript
            switched off.
          */}
          <form
            action="/destinations"
            method="get"
            className="mt-10 flex flex-col gap-4 rounded-2xl border border-separator bg-surface p-5 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="home-intent"
                className="font-ui text-sm font-medium text-label"
              >
                What do you want to do?
              </label>
              <select
                id="home-intent"
                name="intent"
                defaultValue=""
                className="w-full rounded-lg border border-separator bg-surface px-3 py-2 text-sm text-label
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

            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="home-region"
                className="font-ui text-sm font-medium text-label"
              >
                Where?
              </label>
              <select
                id="home-region"
                name="region"
                defaultValue=""
                className="w-full rounded-lg border border-separator bg-surface px-3 py-2 text-sm text-label
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

      {/* 2. Audience fork */}
      <section
        aria-labelledby="audience-heading"
        className="mx-auto w-full max-w-6xl px-5 py-20"
      >
        <h2 id="audience-heading" className="text-2xl font-semibold">
          Where do you fit?
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            href="/destinations"
            className="group flex flex-col rounded-2xl border border-separator bg-surface p-8 no-underline
              transition-colors duration-200 motion-reduce:transition-none hover:bg-bg-grouped
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
          >
            <h3 className="font-ui text-xl font-semibold text-label group-hover:underline">
              For Individuals
            </h3>
            <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
              Moving for work, study, family, investment or to settle. Start
              from what you want to do and see which routes fit.
            </p>
          </Link>

          <div
            aria-disabled="true"
            className="flex flex-col rounded-2xl border border-separator bg-surface p-8 opacity-70"
          >
            <h3 className="flex flex-wrap items-center gap-3 font-ui text-xl font-semibold text-label">
              For Business
              <span className="rounded bg-fill px-1.5 py-0.5 font-ui text-[0.6875rem] font-medium text-label-2">
                Coming soon
              </span>
            </h3>
            <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
              Hiring global talent, posting roles and partnering with us. These
              pages are not written yet.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Intents */}
      <section
        aria-labelledby="intents-heading"
        className="mx-auto w-full max-w-6xl px-5 pb-20"
      >
        <h2 id="intents-heading" className="text-2xl font-semibold">
          What do you want to do?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTENTS.map((intent) => (
            <IntentCard
              key={intent.slug}
              intent={intent}
              href={`/destinations?intent=${intent.slug}`}
              count={countFor(intent.slug)}
            />
          ))}
        </div>
      </section>

      {/* 4. Destinations */}
      <section
        aria-labelledby="destinations-heading"
        className="mx-auto w-full max-w-6xl px-5 pb-20"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="destinations-heading" className="text-2xl font-semibold">
            Destinations
          </h2>
          <Link
            href="/destinations"
            className="text-sm text-tint underline underline-offset-2
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
          >
            See all {countries.length}
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.slice(0, 6).map((country) => (
            <CountryCard
              key={country.slug}
              country={country}
              programCount={programsPerCountry.get(country.slug) ?? 0}
            />
          ))}
        </div>
      </section>

      {/* 5. Trust */}
      <section
        aria-labelledby="trust-heading"
        className="mx-auto w-full max-w-6xl px-5 pb-20"
      >
        <h2 id="trust-heading" className="text-2xl font-semibold">
          Why people use Vistolane
        </h2>
        {/*
          TODO(content): every tile below is a placeholder and says so on its
          face. Verified trust content — testimonials with consent, metrics the
          client can evidence, and any certification or membership they actually
          hold — is owed by the client. Nothing here may be replaced with an
          approximation: an unevidenced statistic on an immigration site is a
          legal exposure for them, not a design detail.
        */}
        <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
          This section is deliberately unfilled. Nothing below is real content.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Client testimonial pending",
            "Client testimonial pending",
            "Success metric pending",
            "Success metric pending",
            "Certification or membership pending",
            "Regulator registration pending",
          ].map((placeholder, index) => (
            <div
              key={`${placeholder}-${index}`}
              className="flex min-h-32 flex-col justify-center rounded-2xl border border-dashed border-separator bg-bg-grouped p-6"
            >
              <p className="font-ui text-sm font-medium text-label-2">
                {placeholder}
              </p>
              <p className="mt-2 font-data text-xs text-label-3">
                Awaiting verified content from the client
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Soft bridge */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-24">
        <SoftBridge />
      </section>
    </main>
  );
}
