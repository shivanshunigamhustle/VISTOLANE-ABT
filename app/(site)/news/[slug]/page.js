import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import {
  getAllCountries,
  getAllNewsUpdates,
  getAllPrograms,
  getNewsUpdate,
} from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * @returns {Promise<Array<{ slug: string }>>}
 */
export async function generateStaticParams() {
  const updates = await getAllNewsUpdates();
  return updates.map((update) => ({ slug: update.slug }));
}

/**
 * @param {{ params: Promise<{ slug: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const update = await getNewsUpdate(slug);
  if (!update) return {};

  return pageMetadata({
    title: `${update.title} | Vistolane`,
    description: update.body.slice(0, 155),
    path: `/news/${update.slug}`,
    type: "article",
  });
}

/**
 * @param {{ params: Promise<{ slug: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function NewsUpdatePage({ params }) {
  const { slug } = await params;
  const update = await getNewsUpdate(slug);
  if (!update) notFound();

  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
  ]);
  const relatedCountries = update.countries
    .map((c) => countries.find((country) => country.slug === c))
    .filter(Boolean);
  const relatedPrograms = update.programs
    .map((p) => programs.find((program) => program.slug === p))
    .filter(Boolean);

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "News", path: "/news" },
          { name: update.title, path: `/news/${update.slug}` },
        ])}
      />

      <PageMasthead
        eyebrow="News"
        title={update.title}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: update.title },
        ]}
        stats={[
          { label: "Effective", value: update.effectiveDate },
          {
            label: "Countries",
            value:
              relatedCountries.length > 0
                ? relatedCountries.map((c) => c.name).join(", ")
                : "N/A",
          },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="t-body max-w-[68ch] text-label">{update.body}</p>

        <div className="mt-10 border-t border-rule pt-6">
          <h2 className="t-eyebrow mb-3">Sources</h2>
          <ul className="space-y-1.5">
            {update.sources.map((source) => (
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
            Last reviewed {update.lastReviewed} · {update.author.name},{" "}
            {update.author.credentials}
          </p>
        </div>

        {relatedCountries.length > 0 || relatedPrograms.length > 0 ? (
          <div className="mt-10">
            <h2 className="t-eyebrow mb-3">Where this applies</h2>
            <ul className="flex flex-wrap gap-3">
              {relatedCountries.map((country) => (
                <li key={country.slug}>
                  <Link
                    href={`/destinations/${country.slug}`}
                    className="color-transition inline-flex items-center rounded-pill border border-separator bg-transparent px-3 py-1.5 text-sm text-label no-underline hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {country.name}
                  </Link>
                </li>
              ))}
              {relatedPrograms.map((program) => (
                <li key={program.slug}>
                  <Link
                    href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                    className="color-transition inline-flex items-center rounded-pill border border-separator bg-transparent px-3 py-1.5 text-sm text-label no-underline hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-10 text-sm">
          <Link
            href="/news"
            className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
          >
            All updates
          </Link>
        </p>
      </div>
    </main>
  );
}
