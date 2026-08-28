/**
 * Scaffold home page.
 *
 * Its only job right now is to prove the token pipeline: every colour and font
 * below comes from a Tailwind utility that resolves to a custom property in
 * styles/tokens.css, so the page follows the OS appearance with no extra work.
 */

/** @type {ReadonlyArray<{ key: string, label: string, className: string }>} */
const INTENTS = [
  { key: "visitor", label: "Visitor", className: "bg-intent-visitor" },
  { key: "work", label: "Work", className: "bg-intent-work" },
  { key: "study", label: "Study", className: "bg-intent-study" },
  { key: "family", label: "Family", className: "bg-intent-family" },
  { key: "investor", label: "Investor", className: "bg-intent-investor" },
  { key: "residence", label: "Residence", className: "bg-intent-residence" },
];

/** @returns {JSX.Element} */
export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="font-data text-xs uppercase tracking-widest text-label-3">
        Vistolane ABT
      </p>

      <h1 className="mt-3 font-read text-4xl leading-tight">
        Scaffold is standing.
      </h1>

      <p className="mt-4 max-w-prose text-label-2">
        Next.js 15 on the App Router, Tailwind v4 wired to the design tokens.
        Switch your system appearance between light and dark — every value on
        this page is a token, so the whole page follows.
      </p>

      <section
        aria-labelledby="surface-heading"
        className="mt-10 rounded-xl border border-separator bg-surface p-6"
      >
        <h2 id="surface-heading" className="text-lg font-semibold">
          Surface
        </h2>
        <p className="mt-2 text-label-2">
          A card on{" "}
          <code className="font-data text-label">--color-surface</code> with a{" "}
          <code className="font-data text-label">--color-separator</code>{" "}
          border.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-lg bg-brand px-3 py-1.5 text-sm text-on-brand">
            Brand
          </span>
          <span className="rounded-lg bg-fill px-3 py-1.5 text-sm text-label">
            Fill
          </span>
          <a
            href="#main-content"
            className="rounded-lg px-3 py-1.5 text-sm text-tint underline underline-offset-2"
          >
            Tint
          </a>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <span className="text-success">Success</span>
          <span className="text-warning">Warning</span>
          <span className="text-danger">Danger</span>
        </div>
      </section>

      <section aria-labelledby="intent-heading" className="mt-10">
        <h2 id="intent-heading" className="text-lg font-semibold">
          Intents
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {INTENTS.map((intent) => (
            <li
              key={intent.key}
              className="flex items-center gap-2 rounded-lg bg-bg-grouped px-3 py-2 text-sm"
            >
              <span
                aria-hidden="true"
                className={`size-2.5 shrink-0 rounded-full ${intent.className}`}
              />
              {intent.label}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
