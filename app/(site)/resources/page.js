import Link from "next/link";

import { Chip } from "@/components/primitives/Chip";
import JsonLd from "@/components/site/JsonLd";
import { INTENTS, getIntent } from "@/lib/content/intents";
import { getAllGuides } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

const TITLE = "Guides";
const DESCRIPTION =
  "Explainers that sit alongside the route guides — how to compare routes, and how to read the figures on them.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/resources",
});

/**
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function ResourcesIndexPage({ searchParams }) {
  const raw = await searchParams;
  const first = (value) => (Array.isArray(value) ? value[0] : value);
  const activeIntent = first(raw.intent);

  const guides = await getAllGuides();
  const matches = activeIntent
    ? guides.filter((g) => g.intent === activeIntent)
    : guides;

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/resources" },
        ])}
      />

      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <p className="t-eyebrow text-on-brand opacity-70">Reference</p>
          <h1 className="t-page-title mt-6 text-on-brand">{TITLE}</h1>
          <p className="t-lede mt-5 max-w-[60ch] text-on-brand opacity-85">
            {DESCRIPTION}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <div role="group" aria-label="Filter by intent" className="flex flex-wrap gap-2">
          <Chip href="/resources" pressed={!activeIntent}>
            All guides
          </Chip>
          {INTENTS.map((intent) => (
            <Chip
              key={intent.slug}
              href={`/resources?intent=${intent.slug}`}
              pressed={activeIntent === intent.slug}
            >
              {intent.label}
            </Chip>
          ))}
        </div>

        {matches.length === 0 ? (
          <div className="surface-raised mt-10 p-8">
            <h2 className="t-section text-label">
              No guides for that intent yet
            </h2>
            <p className="mt-6 text-sm">
              <Link
                href="/resources"
                className="text-tint underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                See all guides
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <p aria-live="polite" className="t-data mb-6 text-label-2">
              {matches.length} guide{matches.length === 1 ? "" : "s"}
            </p>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/resources/${guide.slug}`}
                    className="lift-card surface-raised flex h-full flex-col p-6 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {guide.intent ? (
                      <span className="t-eyebrow" style={{ color: `var(${getIntent(guide.intent)?.token})` }}>
                        {getIntent(guide.intent)?.label}
                      </span>
                    ) : null}
                    <h2 className="t-subsection mt-2 text-label">
                      {guide.title}
                    </h2>
                    <p className="mt-2 flex-1 font-read text-sm text-label-2">
                      {guide.standfirst}
                    </p>
                    <p className="t-data mt-4 text-xs text-label-2">
                      {guide.readingTime} min read
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
