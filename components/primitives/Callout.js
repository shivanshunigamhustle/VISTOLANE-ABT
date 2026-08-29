/**
 * An aside that sits inside or beside body content.
 *
 * As with Badge, the tone hue carries the fill, the rail and the icon, and never
 * the text. The tone word appears in the title, so the meaning survives without
 * colour.
 *
 * @typedef {"note" | "warning" | "source"} CalloutTone
 *
 * @typedef {Object} SourceEntry
 * @property {string} label
 * @property {string} url
 * @property {string} retrieved  ISO date the source was last checked.
 */

/** @type {Record<CalloutTone, { hue: string, icon: JSX.Element, fallbackTitle: string }>} */
const TONES = {
  note: {
    hue: "var(--color-tint)",
    fallbackTitle: "Note",
    icon: (
      <>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 7.25v4" />
        <path d="M8 4.9v.4" />
      </>
    ),
  },
  warning: {
    hue: "var(--color-warning)",
    fallbackTitle: "Warning",
    icon: (
      <>
        <path d="M8 2.5 14.5 13.5H1.5L8 2.5Z" />
        <path d="M8 6.5v3" />
        <path d="M8 11.6v.4" />
      </>
    ),
  },
  source: {
    hue: "var(--color-label-2)",
    fallbackTitle: "Sources",
    icon: (
      <>
        <path d="M3.5 2.5h6l3 3v8h-9v-11Z" />
        <path d="M9.5 2.5v3h3" />
        <path d="M5.5 8.5h5M5.5 10.5h3" />
      </>
    ),
  },
};

/**
 * @param {{ tone?: CalloutTone, title?: string, sources?: SourceEntry[], children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function Callout({ tone = "note", title, sources, children }) {
  const { hue, icon, fallbackTitle } = TONES[tone] ?? TONES.note;
  const heading = title ?? fallbackTitle;
  // The sources block carries links, and an 8% tint over the inset band pushed
  // them to 4.36:1. It keeps the rail and drops the fill so the links sit on the
  // band itself, where they clear AA.
  const filled = tone !== "source";

  return (
    <aside
      className="my-6 rounded-r-[var(--radius-card)] border-l-2 p-4 text-label"
      style={{
        borderLeftColor: hue,
        ...(filled
          ? { backgroundColor: `color-mix(in srgb, ${hue} 8%, transparent)` }
          : {}),
      }}
    >
      <p className="flex items-center gap-2 font-ui text-sm font-semibold">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
          style={{ color: hue }}
        >
          {icon}
        </svg>
        {heading}
      </p>

      {children ? (
        <div className="mt-2 text-sm leading-relaxed text-label-2">
          {children}
        </div>
      ) : null}

      {sources?.length ? (
        <ol className="mt-3 space-y-2.5 text-sm">
          {sources.map((source) => (
            <li key={source.url} className="[overflow-wrap:anywhere]">
              <a
                href={source.url}
                className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                rel="noreferrer noopener"
                target="_blank"
              >
                {source.label}
              </a>
              <span className="mt-0.5 block font-data text-xs text-label-2">
                Retrieved {source.retrieved}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </aside>
  );
}
