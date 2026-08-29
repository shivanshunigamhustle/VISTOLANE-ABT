import GithubSlugger from "github-slugger";

/**
 * Heading extraction for in-page contents.
 *
 * Pure and server-safe, so a server component can call it while the rail that
 * renders the result is a client component.
 *
 * Ids come from github-slugger, which is the slugger rehype-slug uses, so the
 * anchors here match the ids rehype-slug puts on the rendered headings. If the
 * MDX pipeline ever changes its slug plugin, this has to change with it.
 *
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
