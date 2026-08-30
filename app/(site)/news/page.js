import Link from "next/link";

import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import { getAllCountries, getAllNewsUpdates } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

const TITLE = "News";
const DESCRIPTION =
  "Policy changes that affect the routes on this site, dated to when they took effect — or, where a change is still proposed, to what actually happened and when.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/news",
});

export default async function NewsIndexPage() {
  const [updates, countries] = await Promise.all([
    getAllNewsUpdates(),
    getAllCountries(),
  ]);

  const sorted = [...updates].sort((a, b) =>
    b.effectiveDate.localeCompare(a.effectiveDate)
  );
  const countryLookup = new Map(countries.map((c) => [c.slug, c.name]));
  const countriesTouched = new Set(updates.flatMap((u) => u.countries)).size;

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/news" },
        ])}
      />

      <PageMasthead
        eyebrow="Updates"
        title={TITLE}
        standfirst={DESCRIPTION}
        breadcrumb={[{ label: "Home", href: "/" }, { label: TITLE }]}
        stats={[
          { label: "Updates", value: updates.length },
          { label: "Countries affected", value: countriesTouched },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        {sorted.length === 0 ? (
          <p className="t-body text-label-2">No updates yet.</p>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {sorted.map((update) => {
              const countryNames = update.countries
                .map((slug) => countryLookup.get(slug))
                .filter(Boolean);
              return (
                <li key={update.slug} className="py-6">
                  <Link
                    href={`/news/${update.slug}`}
                    className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <time className="t-data text-xs text-label-2">
                        Effective {update.effectiveDate}
                      </time>
                      {countryNames.length > 0 ? (
                        <span className="flex flex-wrap gap-1.5">
                          {countryNames.map((name) => (
                            <span
                              key={name}
                              className="rounded-pill border border-separator px-2 py-0.5 text-[0.6875rem] font-medium text-label-2"
                            >
                              {name}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="t-subsection mt-1.5 text-label group-hover:underline">
                      {update.title}
                    </h2>
                    <p className="mt-2 max-w-[68ch] font-read text-sm text-label-2">
                      {update.body.slice(0, 220)}
                      {update.body.length > 220 ? "…" : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
