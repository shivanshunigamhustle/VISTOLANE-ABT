/**
 * The sources block, shared by the country and programme pages.
 *
 * This is the site's whole proposition made visible: every figure traces to
 * an official page, and the date it was checked. The framing sentence above
 * the list carries that claim and is set with real weight rather than as a
 * caption — it is not decoration, it is the argument for why the page can be
 * trusted.
 *
 * @param {{
 *   sources: Array<{ label: string, url: string, retrieved: string }>,
 * }} props
 * @returns {JSX.Element}
 */
export default function ProvenancePanel({ sources }) {
  return (
    <div>
      <p className="t-body max-w-[56ch] text-label">
        Every figure on this page links to the government page it came from,
        with the date it was checked.
      </p>

      <ol className="mt-8 grid gap-x-10 gap-y-6 border-t border-rule pt-6 md:grid-cols-2">
        {sources.map((source) => (
          <li key={source.url} className="[overflow-wrap:anywhere]">
            <a
              href={source.url}
              rel="noreferrer noopener"
              target="_blank"
              className="font-ui text-[0.9375rem] font-medium link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              {source.label}
            </a>
            <span className="mt-1 block font-data text-xs text-label-2">
              Retrieved {source.retrieved}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
