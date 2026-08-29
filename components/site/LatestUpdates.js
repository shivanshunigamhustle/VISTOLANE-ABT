import Link from "next/link";

/**
 * News updates that reference this specific country or programme. This is
 * the freshness signal the countries[]/programs[] relationship on a news
 * record exists for — a change is written once and then appears everywhere
 * it actually affects, rather than needing to be repeated by hand on every
 * page it touches.
 *
 * Renders nothing when there are no updates for this page, rather than an
 * empty section.
 *
 * @param {{ updates: import("@/lib/content/schema").NewsUpdate[] }} props
 * @returns {JSX.Element | null}
 */
export default function LatestUpdates({ updates }) {
  if (!updates || updates.length === 0) return null;

  return (
    <section aria-labelledby="latest-updates-heading">
      <h2 id="latest-updates-heading" className="t-eyebrow mb-4">
        Latest updates
      </h2>
      <ul className="divide-y divide-rule border-y border-rule">
        {updates.map((update) => (
          <li key={update.slug} className="py-4">
            <Link
              href={`/news/${update.slug}`}
              className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              <time className="t-data text-xs text-label-2">
                Effective {update.effectiveDate}
              </time>
              <p className="mt-1 font-ui text-sm font-medium text-label group-hover:underline">
                {update.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
