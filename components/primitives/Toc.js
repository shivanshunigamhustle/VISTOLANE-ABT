import GithubSlugger from "github-slugger";

/**
 * In-page contents, built from the top-level headings of a body.
 *
 * Ids come from github-slugger, which is the slugger rehype-slug uses, so the
 * anchors here match the ids rehype-slug will put on the rendered headings. If
 * the MDX pipeline ever changes its slug plugin, this has to change with it.
 */

/**
 * @typedef {Object} TocHeading
 * @property {string} id
 * @property {string} text
 */

/**
 * Extract the h2 headings from raw MDX, skipping anything inside a code fence
 * so a commented-out heading in an example does not appear in the contents.
 *
 * @param {string} body  Raw MDX body, without frontmatter.
 * @returns {TocHeading[]}
 */
export function tocFromMdx(body) {
  const slugger = new GithubSlugger();
  /** @type {TocHeading[]} */
  const headings = [];
  let inFence = false;

  for (const line of String(body ?? "").split("\n")) {
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^##[^#]\s*(.+?)\s*$/.exec(line);
    if (match) {
      const text = match[1].trim();
      headings.push({ id: slugger.slug(text), text });
    }
  }

  return headings;
}

/**
 * @param {{ headings: TocHeading[] }} props
 * @returns {JSX.Element | null}
 */
function TocList({ headings }) {
  return (
    <ol className="space-y-2 text-sm">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className="block text-label-2 underline-offset-2 transition-colors duration-200
              motion-reduce:transition-none hover:text-label hover:underline
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Sticky beside the body on desktop, a collapsed disclosure on small screens.
 *
 * @param {{ headings: TocHeading[], label?: string }} props
 * @returns {JSX.Element | null}
 */
export default function Toc({ headings, label = "On this page" }) {
  if (!headings || headings.length === 0) return null;

  return (
    <>
      <nav
        aria-label={label}
        className="hidden md:sticky md:top-8 md:block md:self-start"
      >
        <p className="mb-3 font-ui text-xs font-semibold uppercase tracking-wide text-label-3">
          {label}
        </p>
        <TocList headings={headings} />
      </nav>

      <details className="rounded-xl border border-separator bg-surface p-4 md:hidden">
        <summary className="cursor-pointer font-ui text-sm font-semibold text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint">
          {label}
        </summary>
        <div className="mt-3">
          <TocList headings={headings} />
        </div>
      </details>
    </>
  );
}
