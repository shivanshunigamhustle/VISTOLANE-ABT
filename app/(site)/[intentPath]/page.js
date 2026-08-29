import Link from "next/link";
import { notFound } from "next/navigation";

import DataTable from "@/components/primitives/DataTable";
import { FieldValue } from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { INTENTS, getIntentByPath } from "@/lib/content/intents";
import { getAllCountries, getPrograms } from "@/lib/content/loader";
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
 * Routed as app/(site)/[intentPath]/page.js — a single dynamic segment,
 * because Next.js resolves the sibling literal directories (/business,
 * /destinations, /tools, and so on) before falling through to this one, so
 * the six real paths and the fixed site routes never collide.
 */

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
          <p className="t-lede mt-5 max-w-[60ch] text-on-brand opacity-85">
            Every {intent.label.toLowerCase()} route Vistolane covers,
            compared across {countries.length}{" "}
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
              under:{" "}
              {countries.map((c) => c.name).join(", ")}
              , as those are written.
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
                    className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {program.name}
                  </Link>
                ),
                country:
                  countryName.get(program.countrySlug) ?? program.countrySlug,
                processingTime: <FieldValue value={program.processingTime} />,
                validity: <FieldValue value={program.validity} />,
              }))}
            />
          </div>
        )}
      </div>

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SectionHeading eyebrow="Coverage">Where this applies</SectionHeading>

          {covering.length > 0 ? (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {covering.map((country) => (
                <li key={country.slug}>
                  <Link
                    href={`/destinations/${country.slug}/${intent.slug}`}
                    className="lift-card surface-raised block p-5 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    <h3 className="t-subsection text-label">
                      {country.name}
                    </h3>
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
          <ul className="flex flex-wrap gap-3">
            {otherIntents.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/${other.path}`}
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
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
