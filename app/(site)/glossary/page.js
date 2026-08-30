import Link from "next/link";

import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import { getAllTerms } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The glossary index — an A–Z list with a jump bar.
 *
 * Every term the guides use, made navigable. Each entry links to its own
 * page rather than expanding inline, so a term is a real crawlable URL that
 * a guide, a country page or another term can point to directly.
 */

const TITLE = "Glossary";
const DESCRIPTION =
  "Immigration terms used across Vistolane's guides — from Canada's Express Entry system to Vietnam's investor visa tiers — defined and sourced.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/glossary",
});

export default async function GlossaryIndexPage() {
  const terms = await getAllTerms();

  /** @type {Map<string, import("@/lib/content/schema").GlossaryTerm[]>} */
  const byLetter = new Map();
  for (const term of terms) {
    const letter = term.term.charAt(0).toUpperCase();
    const list = byLetter.get(letter) ?? [];
    list.push(term);
    byLetter.set(letter, list);
  }
  const letters = [...byLetter.keys()].sort();

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/glossary" },
        ])}
      />

      <PageMasthead
        eyebrow="Reference"
        title={TITLE}
        standfirst={DESCRIPTION}
        breadcrumb={[{ label: "Home", href: "/" }, { label: TITLE }]}
        stats={[
          { label: "Terms defined", value: terms.length },
          { label: "Letters covered", value: letters.length },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        {letters.length === 0 ? (
          <p className="t-body text-label-2">No terms yet.</p>
        ) : (
          <>
            <nav
              aria-label="Jump to letter"
              className="surface-raised flex flex-wrap gap-2 p-4"
            >
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="color-transition inline-flex size-8 items-center justify-center rounded-pill bg-fill font-ui text-sm font-medium text-label no-underline hover:bg-separator focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  {letter}
                </a>
              ))}
            </nav>

            <div className="mt-10 space-y-10">
              {letters.map((letter) => (
                <section key={letter} aria-labelledby={`letter-${letter}`}>
                  <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
                    <h2
                      id={`letter-${letter}`}
                      className="t-eyebrow scroll-mt-24"
                    >
                      {letter}
                    </h2>
                    <p className="t-data text-xs text-label-3">
                      {byLetter.get(letter).length} term
                      {byLetter.get(letter).length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ul className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {byLetter.get(letter).map((term) => (
                      <li key={term.slug}>
                        <Link
                          href={`/glossary/${term.slug}`}
                          className="color-transition inline-block py-1.5 text-sm text-label no-underline hover:text-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                        >
                          {term.term}
                          {term.aliases.length > 0 ? (
                            <span className="text-label-2">
                              {" "}
                              ({term.aliases[0]})
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
