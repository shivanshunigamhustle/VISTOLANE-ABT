import Link from "next/link";

import Badge from "@/components/primitives/Badge";
import DataTable from "@/components/primitives/DataTable";
import Unverified, {
  FieldValue,
  splitUnverified,
} from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import SectionHeading from "@/components/site/SectionHeading";
import { getIntent } from "@/lib/content/intents";
import { getAllCountries, getPrograms } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The cost estimator.
 *
 * A three-step, server-rendered flow addressed entirely by the URL: pick a
 * country, then a route within it, then read the fee breakdown. No client
 * state — every step is a real link, so the page works with JavaScript
 * disabled and every intermediate state is itself a crawlable URL.
 *
 * The total only ever sums confirmed amounts. A fee recorded as
 * unconfirmed (amount: null) is never estimated into the total — it is
 * counted and named separately, so a reader never mistakes a partial total
 * for a complete one.
 */

const TITLE = "Cost estimator";
const DESCRIPTION =
  "Government fees for a route, totalled, with anything that could not be confirmed shown separately, never folded into the total.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/tools/cost-estimator",
});

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function CostEstimatorPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const countrySlug = first(raw.country);
  const programSlug = first(raw.program);

  const countries = await getAllCountries();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: TITLE, path: "/tools/cost-estimator" },
  ];

  // Step 3: a country and a route are both chosen — show the breakdown.
  if (countrySlug && programSlug) {
    const countryPrograms = await getPrograms({ country: countrySlug });
    const program = countryPrograms.find((p) => p.slug === programSlug);
    const country = countries.find((c) => c.slug === countrySlug);

    if (!program || !country) {
      return (
        <main id="main-content">
          <EstimatorShell crumbs={crumbs}>
            <div className="surface-raised p-8">
              <h2 className="t-section text-label">Route not found</h2>
              <p className="t-body mt-4 text-label">
                That country and route combination does not exist.
              </p>
              <p className="mt-6 text-sm">
                <Link
                  href="/tools/cost-estimator"
                  className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Start again
                </Link>
              </p>
            </div>
          </EstimatorShell>
        </main>
      );
    }

    const confirmed = program.fees.filter((fee) => fee.amount !== null);
    const unconfirmed = program.fees.filter((fee) => fee.amount === null);

    // Fees are recorded in their native currency; a route's fees are, in
    // practice, all in the same currency, so summing is meaningful. A mixed-
    // currency total would need conversion this data does not carry.
    const totalsByCurrency = new Map();
    for (const fee of confirmed) {
      totalsByCurrency.set(
        fee.currency,
        (totalsByCurrency.get(fee.currency) ?? 0) + fee.amount
      );
    }

    const intentLabel = getIntent(program.intent)?.label ?? program.intent;
    const programPath = `/destinations/${program.countrySlug}/${program.intent}/${program.slug}`;

    return (
      <main id="main-content">
        <EstimatorShell
          crumbs={[
            ...crumbs,
            {
              name: country.name,
              path: `/tools/cost-estimator?country=${country.slug}`,
            },
            { name: program.name, path: `${programPath}` },
          ]}
        >
          <p className="text-sm">
            <Link
              href="/tools/cost-estimator"
              className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              Start again
            </Link>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge tone={program.intent}>{intentLabel}</Badge>
            <h2 className="t-section text-label">{program.name}</h2>
          </div>
          <p className="mt-1 font-read text-label-2">{country.name}</p>

          <div className="mt-8">
            <DataTable
              columns={[
                { key: "item", label: "Item", width: "26%" },
                {
                  key: "amount",
                  label: "Amount",
                  align: "right",
                  mono: true,
                  width: "16%",
                  nowrap: true,
                },
                { key: "payableBy", label: "Payable by", width: "20%" },
                { key: "note", label: "Note" },
              ]}
              rows={program.fees.map((fee) => ({
                item: fee.item,
                amount:
                  fee.amount === null ? (
                    <Unverified reason={splitUnverified(fee.note).reason} />
                  ) : (
                    `${fee.amount.toLocaleString("en-CA")} ${fee.currency}`
                  ),
                payableBy: fee.payableBy,
                note:
                  fee.amount === null ? null : fee.note ? (
                    <FieldValue value={fee.note} />
                  ) : null,
              }))}
            />
          </div>

          <div className="surface-raised mt-6 p-6">
            <h3 className="t-subsection text-label">Total of confirmed fees</h3>
            {totalsByCurrency.size === 0 ? (
              <p className="t-body mt-2 text-label-2">
                None of this route&apos;s fees are confirmed yet; every figure
                below still needs to be checked against an official source.
              </p>
            ) : (
              <p className="t-figure mt-2 text-label">
                {[...totalsByCurrency.entries()]
                  .map(
                    ([currency, total]) =>
                      `${total.toLocaleString("en-CA")} ${currency}`
                  )
                  .join(" + ")}
              </p>
            )}
            {unconfirmed.length > 0 ? (
              <p className="mt-3 font-ui text-sm text-label-2">
                {unconfirmed.length}{" "}
                {unconfirmed.length === 1 ? "fee is" : "fees are"} not included
                in this total because{" "}
                {unconfirmed.length === 1 ? "it is" : "they are"} not yet
                confirmed against an official source:{" "}
                {unconfirmed.map((fee) => fee.item).join(", ")}.
              </p>
            ) : null}
          </div>

          {program.quotas ? (
            <p className="mt-4 max-w-[68ch] font-read leading-relaxed text-label-2">
              <FieldValue value={program.quotas} />
            </p>
          ) : null}

          <p className="mt-8 text-sm">
            <Link
              href={programPath}
              className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              Read the full guide for {program.name}
            </Link>
          </p>
        </EstimatorShell>
      </main>
    );
  }

  // Step 2: a country is chosen — show its routes.
  if (countrySlug) {
    const country = countries.find((c) => c.slug === countrySlug);
    const countryPrograms = country
      ? await getPrograms({ country: countrySlug })
      : [];

    if (!country) {
      return (
        <main id="main-content">
          <EstimatorShell crumbs={crumbs}>
            <div className="surface-raised p-8">
              <h2 className="t-section text-label">Country not found</h2>
              <p className="mt-6 text-sm">
                <Link
                  href="/tools/cost-estimator"
                  className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Start again
                </Link>
              </p>
            </div>
          </EstimatorShell>
        </main>
      );
    }

    return (
      <main id="main-content">
        <EstimatorShell
          crumbs={[
            ...crumbs,
            {
              name: country.name,
              path: `/tools/cost-estimator?country=${country.slug}`,
            },
          ]}
        >
          <SectionHeading eyebrow="Step 2 of 2">
            Which route in {country.name}?
          </SectionHeading>

          {countryPrograms.length === 0 ? (
            <div className="surface-raised mt-8 p-8">
              <h2 className="t-section text-label">
                No routes for {country.name} yet
              </h2>
              <p className="t-body mt-4 text-label">
                Fees have not been written for this country yet.
              </p>
              <p className="mt-6 text-sm">
                <Link
                  href="/tools/cost-estimator"
                  className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  Choose a different country
                </Link>
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {countryPrograms.map((program) => (
                <li key={program.slug}>
                  <Link
                    href={`/tools/cost-estimator?country=${country.slug}&program=${program.slug}`}
                    className="lift-card surface-raised block p-5 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    <Badge tone={program.intent}>
                      {getIntent(program.intent)?.label ?? program.intent}
                    </Badge>
                    <h3 className="t-subsection mt-3 text-label">
                      {program.name}
                    </h3>
                    <p className="mt-1 font-ui text-sm text-label-2">
                      {program.fees.length}{" "}
                      {program.fees.length === 1 ? "fee line" : "fee lines"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </EstimatorShell>
      </main>
    );
  }

  // Step 1: nothing chosen yet — pick a country.
  return (
    <main id="main-content">
      <EstimatorShell crumbs={crumbs}>
        <SectionHeading eyebrow="Step 1 of 2">Which country?</SectionHeading>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <li key={country.slug}>
              <Link
                href={`/tools/cost-estimator?country=${country.slug}`}
                className="lift-card surface-raised block p-5 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                <h3 className="t-subsection text-label">{country.name}</h3>
                <p className="mt-1 font-ui text-sm text-label-2">
                  {country.region}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </EstimatorShell>
    </main>
  );
}

/**
 * @param {{ crumbs: Array<{ name: string, path: string }>, children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function EstimatorShell({ crumbs, children }) {
  return (
    <>
      <JsonLd schema={breadcrumbList(crumbs)} />
      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <p className="t-eyebrow text-on-brand opacity-70">Tools</p>
          <h1 className="t-page-title mt-6 text-on-brand">{TITLE}</h1>
          <p className="t-lede mt-5 max-w-[60ch] text-on-brand opacity-85">
            {DESCRIPTION}
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 py-16">{children}</div>
    </>
  );
}
