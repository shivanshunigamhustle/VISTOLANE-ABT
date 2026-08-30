import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import SoftBridge from "@/components/site/SoftBridge";
import { getIntent } from "@/lib/content/intents";
import { getAllPrograms, getAllTerms, getTerm } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * One glossary term.
 *
 * The SoftBridge at the foot is scoped to the intent of the term's related
 * programmes where they share one intent — a reader looking up "Labour
 * Market Impact Assessment" is almost certainly here for a work-intent
 * reason, so the eligibility checker link reflects that rather than sitting
 * generic.
 */

/**
 * @returns {Promise<Array<{ slug: string }>>}
 */
export async function generateStaticParams() {
  const terms = await getAllTerms();
  return terms.map((term) => ({ slug: term.slug }));
}

/**
 * @param {{ params: Promise<{ slug: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const term = await getTerm(slug);
  if (!term) return {};

  return pageMetadata({
    title: `${term.term} | Vistolane Glossary`,
    description: term.definition,
    path: `/glossary/${term.slug}`,
  });
}

/**
 * @param {{ params: Promise<{ slug: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function GlossaryTermPage({ params }) {
  const { slug } = await params;
  const term = await getTerm(slug);
  if (!term) notFound();

  const [allPrograms, allTerms] = await Promise.all([
    getAllPrograms(),
    getAllTerms(),
  ]);

  const relatedPrograms = term.relatedPrograms
    .map((programSlug) => allPrograms.find((p) => p.slug === programSlug))
    .filter(Boolean);

  const relatedTerms = term.relatedTerms
    .map((termSlug) => allTerms.find((t) => t.slug === termSlug))
    .filter(Boolean);

  // Scope the bridge to an intent only when every related programme shares
  // one — a term used across two different intents should not claim either.
  const intents = new Set(relatedPrograms.map((p) => p.intent));
  const scopedIntent = intents.size === 1 ? [...intents][0] : undefined;
  const scopedIntentLabel = scopedIntent
    ? getIntent(scopedIntent)?.label
    : undefined;

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Glossary", path: "/glossary" },
          { name: term.term, path: `/glossary/${term.slug}` },
        ])}
      />

      <PageMasthead
        eyebrow="Glossary"
        title={term.term}
        standfirst={term.definition}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Glossary", href: "/glossary" },
          { label: term.term },
        ]}
        stats={[
          ...(term.aliases.length > 0
            ? [{ label: "Also written as", value: term.aliases.join(", ") }]
            : []),
          { label: "Last reviewed", value: term.lastReviewed },
        ]}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          {term.longform ? (
            <p className="t-body mt-5 max-w-[68ch] text-label">
              {term.longform}
            </p>
          ) : null}

          <div className="mt-10 border-t border-rule pt-6">
            <h2 className="t-eyebrow mb-3">Sources</h2>
            <ul className="space-y-1.5">
              {term.sources.map((source) => (
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
              Last reviewed {term.lastReviewed} · {term.author.name},{" "}
              {term.author.credentials}
            </p>
          </div>

          {relatedPrograms.length > 0 ? (
            <div className="mt-10">
              <h2 className="t-eyebrow mb-3">Where this applies</h2>
              <ul className="space-y-2">
                {relatedPrograms.map((program) => (
                  <li key={program.slug}>
                    <Link
                      href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                      className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {program.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside>
          {relatedTerms.length > 0 ? (
            <div>
              <h2 className="t-eyebrow mb-3">Related terms</h2>
              <ul className="space-y-1.5">
                {relatedTerms.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/glossary/${related.slug}`}
                      className="color-transition text-sm text-label no-underline hover:text-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {related.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-6 text-sm">
            <Link
              href="/glossary"
              className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              All terms
            </Link>
          </p>
        </aside>
      </div>

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SoftBridge intent={scopedIntent} intentLabel={scopedIntentLabel} />
        </div>
      </div>
    </main>
  );
}
