import Link from "next/link";

import Badge from "@/components/primitives/Badge";
import Button from "@/components/primitives/Button";
import Field from "@/components/primitives/Field";
import { FieldValue } from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import PrintButton from "@/components/site/PrintButton";
import SectionHeading from "@/components/site/SectionHeading";
import SoftBridge from "@/components/site/SoftBridge";
import { getIntent } from "@/lib/content/intents";
import { getAllCountries, getPrograms } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The document checklist.
 *
 * The strongest lead magnet on the site, so it gets a longer flow than the
 * other two tools: pick a country, then a route, read the checklist, then
 * either print it or have it emailed. Every step is a server-rendered link
 * or a plain HTML form — nothing here needs JavaScript disabled to keep
 * working, the print button aside (a convenience shortcut, not the
 * mechanism — see PrintButton).
 *
 * The email capture is progressive: step one asks for an email address
 * alone, because the URL already carries exactly which route this is about.
 * Step two — name and phone — only appears after step one has already
 * produced a usable lead, and is optional.
 */

const TITLE = "Document checklist";
const DESCRIPTION =
  "Every document a route requires, grouped by whether it is required or optional. Printable, and can be emailed to you.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/tools/document-checklist",
});

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function DocumentChecklistPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const countrySlug = first(raw.country);
  const programSlug = first(raw.program);

  const countries = await getAllCountries();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: TITLE, path: "/tools/document-checklist" },
  ];

  if (!countrySlug) {
    return (
      <main id="main-content">
        <Shell crumbs={crumbs}>
          <SectionHeading eyebrow="Step 1 of 2">Which country?</SectionHeading>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((country) => (
              <li key={country.slug}>
                <Link
                  href={`/tools/document-checklist?country=${country.slug}`}
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
        </Shell>
      </main>
    );
  }

  const country = countries.find((c) => c.slug === countrySlug);
  if (!country) {
    return (
      <main id="main-content">
        <Shell crumbs={crumbs}>
          <NotFound label="Country not found" />
        </Shell>
      </main>
    );
  }

  const countryPrograms = await getPrograms({ country: countrySlug });

  if (!programSlug) {
    return (
      <main id="main-content">
        <Shell
          crumbs={[
            ...crumbs,
            {
              name: country.name,
              path: `/tools/document-checklist?country=${country.slug}`,
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
              <p className="mt-6 text-sm">
                <Link
                  href="/tools/document-checklist"
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
                    href={`/tools/document-checklist?country=${country.slug}&program=${program.slug}`}
                    className="lift-card surface-raised block p-5 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    <Badge tone={program.intent}>
                      {getIntent(program.intent)?.label ?? program.intent}
                    </Badge>
                    <h3 className="t-subsection mt-3 text-label">
                      {program.name}
                    </h3>
                    <p className="mt-1 font-ui text-sm text-label-2">
                      {program.documents.length}{" "}
                      {program.documents.length === 1
                        ? "document"
                        : "documents"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Shell>
      </main>
    );
  }

  const program = countryPrograms.find((p) => p.slug === programSlug);
  if (!program) {
    return (
      <main id="main-content">
        <Shell crumbs={crumbs}>
          <NotFound label="Route not found" />
        </Shell>
      </main>
    );
  }

  const required = program.documents.filter((d) => d.required);
  const optional = program.documents.filter((d) => !d.required);
  const intentLabel = getIntent(program.intent)?.label ?? program.intent;
  const programPath = `/destinations/${program.countrySlug}/${program.intent}/${program.slug}`;
  const currentPath = `/tools/document-checklist?country=${country.slug}&program=${program.slug}`;

  const sent = first(raw.leadSent);
  const failed = first(raw.leadError);
  const carriedEmail = first(raw.leadEmail) ?? "";

  return (
    <main id="main-content">
      <Shell
        crumbs={[
          ...crumbs,
          {
            name: country.name,
            path: `/tools/document-checklist?country=${country.slug}`,
          },
          { name: program.name, path: programPath },
        ]}
      >
        <div className="no-print flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm">
            <Link
              href="/tools/document-checklist"
              className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              Start again
            </Link>
          </p>
          <PrintButton />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Badge tone={program.intent}>{intentLabel}</Badge>
          <h2 className="t-section text-label">{program.name}</h2>
        </div>
        <p className="mt-1 font-read text-label-2">{country.name}</p>

        {/* Checklist. Everything from here to the review line prints. */}
        <section aria-labelledby="required-heading" className="mt-10">
          <h3 id="required-heading" className="t-subsection text-label">
            Required documents
          </h3>
          {required.length === 0 ? (
            <p className="t-body mt-3 text-label-2">
              No documents on this route are marked required.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {required.map((doc) => (
                <li key={doc.name} className="py-3">
                  <p className="font-ui text-sm font-medium text-label">
                    {doc.name}
                  </p>
                  {doc.note ? (
                    <p className="mt-1 font-read text-sm text-label-2">
                      <FieldValue value={doc.note} />
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {optional.length > 0 ? (
          <section aria-labelledby="optional-heading" className="mt-10">
            <h3 id="optional-heading" className="t-subsection text-label">
              Optional documents
            </h3>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {optional.map((doc) => (
                <li key={doc.name} className="py-3">
                  <p className="font-ui text-sm font-medium text-label">
                    {doc.name}
                  </p>
                  {doc.note ? (
                    <p className="mt-1 font-read text-sm text-label-2">
                      <FieldValue value={doc.note} />
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {country.commonDocuments.length > 0 ? (
          <section aria-labelledby="common-heading" className="mt-10">
            <h3 id="common-heading" className="t-subsection text-label">
              Common documents for {country.name}
            </h3>
            <p className="mt-1 font-ui text-sm text-label-2">
              These apply across every route in {country.name}, not only this
              one.
            </p>
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {country.commonDocuments.map((doc) => (
                <li key={doc.name} className="py-3">
                  <p className="font-ui text-sm font-medium text-label">
                    {doc.name}
                  </p>
                  {doc.note ? (
                    <p className="mt-1 font-read text-sm text-label-2">
                      <FieldValue value={doc.note} />
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="checklist-sources" className="mt-10">
          <h3 id="checklist-sources" className="t-subsection text-label">
            Sources
          </h3>
          <ul className="mt-3 space-y-1.5">
            {program.sources.map((source) => (
              <li key={source.url} className="text-sm">
                <a
                  href={source.url}
                  className="link-accent [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  {source.label}
                </a>{" "}
                <span className="text-label-2">
                  · retrieved {source.retrieved}
                </span>
              </li>
            ))}
          </ul>
          <p className="t-value mt-4 text-label-2">
            Last reviewed {program.lastReviewed} · {program.author.name},{" "}
            {program.author.credentials}
          </p>
        </section>

        {/* Email capture. Progressive: step one is the email alone. */}
        <section aria-labelledby="email-heading" className="no-print mt-14">
          <h3 id="email-heading" className="t-subsection text-label">
            Email me this checklist
          </h3>

          {sent === "complete" ? (
            <div
              role="status"
              className="surface-raised mt-4 p-6 text-sm text-label"
            >
              Thank you. Someone will follow up on your enquiry about{" "}
              {program.name}.
            </div>
          ) : sent === "step1" ? (
            <div className="surface-raised mt-4 space-y-5 p-6">
              <p role="status" className="text-sm text-label">
                Sent. The checklist for {program.name} is on its way to your
                inbox.
              </p>

              <div className="border-t border-rule pt-5">
                <p className="font-ui text-sm font-medium text-label">
                  Want a consultant to look at your case?
                </p>
                <p className="mt-1 font-ui text-sm text-label-2">
                  Optional, add your name and phone number.
                </p>
                <form
                  action="/api/leads"
                  method="POST"
                  className="mt-4 space-y-4"
                >
                  <input
                    type="hidden"
                    name="source"
                    value="document-checklist"
                  />
                  <input type="hidden" name="step" value="2" />
                  <input type="hidden" name="email" value={carriedEmail} />
                  <input
                    type="hidden"
                    name="countrySlug"
                    value={country.slug}
                  />
                  <input type="hidden" name="intent" value={program.intent} />
                  <input
                    type="hidden"
                    name="programSlug"
                    value={program.slug}
                  />
                  <input type="hidden" name="returnTo" value={currentPath} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="checklist-name" name="name" label="Full name" />
                    <Field
                      id="checklist-phone"
                      name="phone"
                      label="Phone number"
                      type="tel"
                    />
                  </div>

                  <Button type="submit" variant="quiet">
                    Add my details
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <form
              action="/api/leads"
              method="POST"
              className="surface-raised mt-4 space-y-4 p-6"
            >
              <input type="hidden" name="source" value="document-checklist" />
              <input type="hidden" name="step" value="1" />
              <input type="hidden" name="countrySlug" value={country.slug} />
              <input type="hidden" name="intent" value={program.intent} />
              <input type="hidden" name="programSlug" value={program.slug} />
              <input type="hidden" name="returnTo" value={currentPath} />

              {failed ? (
                <p
                  role="alert"
                  className="rounded-card border-l-2 p-4 text-sm text-label"
                  style={{
                    borderLeftColor: "var(--color-danger)",
                    backgroundColor:
                      "color-mix(in srgb, var(--color-danger) 8%, transparent)",
                  }}
                >
                  That did not send. Please check your email address and try
                  again.
                </p>
              ) : null}

              <Field
                id="checklist-email"
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                required
              />

              <Button type="submit" variant="primary">
                Email me this checklist
              </Button>
            </form>
          )}
        </section>

        <div className="no-print mt-14">
          <SoftBridge
            country={country.slug}
            intent={program.intent}
            intentLabel={intentLabel}
          />
        </div>
      </Shell>
    </main>
  );
}

/**
 * @param {{ crumbs: Array<{ name: string, path: string }>, children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function Shell({ crumbs, children }) {
  return (
    <>
      <JsonLd schema={breadcrumbList(crumbs)} />
      <div className="no-print band-ink">
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

/**
 * @param {{ label: string }} props
 * @returns {JSX.Element}
 */
function NotFound({ label }) {
  return (
    <div className="surface-raised p-8">
      <h2 className="t-section text-label">{label}</h2>
      <p className="mt-6 text-sm">
        <Link
          href="/tools/document-checklist"
          className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
        >
          Start again
        </Link>
      </p>
    </div>
  );
}
