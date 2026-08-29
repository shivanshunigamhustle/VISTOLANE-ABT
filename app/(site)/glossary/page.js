import Link from "next/link";

import JsonLd from "@/components/site/JsonLd";
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
  "Immigration terms used across Vistolane's guides, defined and sourced.";

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
        {letters.length === 0 ? (
          <p className="t-body text-label-2">No terms yet.</p>
        ) : (
          <>
            <nav aria-label="Jump to letter" className="flex flex-wrap gap-2">
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
                  <h2
                    id={`letter-${letter}`}
                    className="t-eyebrow scroll-mt-24 border-b border-rule pb-2"
                  >
                    {letter}
                  </h2>
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
