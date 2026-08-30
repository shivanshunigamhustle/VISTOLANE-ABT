import Button from "@/components/primitives/Button";
import Field from "@/components/primitives/Field";
import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import PortalLink from "@/components/site/PortalLink";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The one real page behind "For Business".
 *
 * The nav used to promise three sections that did not exist. This is a
 * single built page instead — who Vistolane's business track is for, what it
 * does, and a way to get in touch. No client, volume or outcome claim: none
 * of that is evidenced yet, and this site's whole proposition is accuracy.
 *
 * TODO(OPN-09): the paragraph below is a structural placeholder. The client
 * owes the actual B2B service description — what "working with Vistolane"
 * means for an employer or an agency, in their own words.
 *
 * The form is a plain HTML form, not a client component: it posts straight
 * to /api/leads and works identically with JavaScript on or off, because
 * nothing here intercepts the submit.
 */

const TITLE = "For Business";
const DESCRIPTION =
  "Vistolane for employers and agencies moving people across borders.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/business",
});

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function BusinessPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const sent = first(raw.leadSent);
  const failed = first(raw.leadError);

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/business" },
        ])}
      />

      <PageMasthead
        eyebrow="For Business"
        title="Moving people for work, at the scale your business needs"
        standfirst={DESCRIPTION}
        breadcrumb={[{ label: "Home", href: "/" }, { label: TITLE }]}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="who-heading">
            <h2 id="who-heading" className="t-section">
              Who this is for
            </h2>
            <p className="t-body mt-4 max-w-[68ch] text-label">
              Employers who need to bring skilled workers in from abroad, and
              agencies and practices who manage immigration cases for their own
              clients. Both work from the same route guides that power the rest
              of this site — the same eligibility rules, the same documents, the
              same processing times, traced to the same official sources.
            </p>
          </section>

          <section aria-labelledby="what-heading">
            <h2 id="what-heading" className="t-section">
              What Vistolane does for a business
            </h2>
            {/*
              TODO(OPN-09): placeholder structure only. The client owes the
              real service description in their own words — what a business
              engagement actually includes, priced how, delivered how. Do not
              launch with invented service detail.
            */}
            <ul className="t-body mt-4 max-w-[68ch] list-disc space-y-2 pl-5 text-label">
              <li>
                Route guidance for every worker you are moving, sourced and
                dated the same way as every guide on this site.
              </li>
              <li>
                A single point of contact for questions across the countries you
                operate in.
              </li>
              <li>
                A route into the Vistolane application for case tracking once a
                matter is underway.
              </li>
            </ul>
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="t-section">
              Get in touch
            </h2>

            {sent ? (
              <div
                role="status"
                className="surface-raised mt-6 p-6 text-sm text-label"
              >
                Thank you. Your enquiry has been received and someone will be in
                touch.
              </div>
            ) : (
              <form
                action="/api/leads"
                method="POST"
                className="surface-raised mt-6 space-y-4 p-6"
              >
                <input type="hidden" name="source" value="business" />
                <input type="hidden" name="returnTo" value="/business" />

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
                    That did not send. Please check your answers and try again.
                  </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    id="business-name"
                    name="name"
                    label="Full name"
                    autoComplete="name"
                    required
                  />
                  <Field
                    id="business-email"
                    name="email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>
                <Field
                  id="business-company"
                  name="countryOfResidence"
                  label="Company or agency"
                  hint="So we know who is enquiring."
                  required
                />
                <Field
                  id="business-phone"
                  name="phone"
                  label="Phone number"
                  type="tel"
                  autoComplete="tel"
                />
                <Field
                  id="business-message"
                  name="message"
                  as="textarea"
                  label="What are you looking to do"
                  hint="Roughly how many people, and in which countries."
                />

                <Button type="submit" variant="primary">
                  Send enquiry
                </Button>
              </form>
            )}
          </section>
        </div>

        <aside>
          <div className="surface-raised p-6">
            <h2 className="t-subsection">Already a Vistolane client</h2>
            <p className="mt-2 font-ui text-sm text-label-2">
              Sign in to the application to manage cases already underway.
            </p>
            <div className="mt-4">
              <PortalLink />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
