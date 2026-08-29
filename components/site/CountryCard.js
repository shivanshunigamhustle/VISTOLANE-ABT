import Link from "next/link";
import Unverified, {
  splitUnverified,
} from "@/components/primitives/Unverified";

/** Structural labels for the cost band enum. */
const COST_BAND = { low: "Low", medium: "Medium", high: "High" };

/**
 * A country on the destination grid, carrying real data rather than an icon.
 *
 * The cost band is an editorial classification rather than an official figure,
 * so it is shown with the unverified chip wherever the record's own
 * cost-of-living field is still flagged. That keeps the grid from asserting a
 * band the research does not support.
 *
 * @param {{
 *   country: import("@/lib/content/schema").Country,
 *   programCount: number,
 * }} props
 * @returns {JSX.Element}
 */
export default function CountryCard({ country, programCount }) {
  const costBandUnverified = Boolean(
    splitUnverified(country.living.costOfLiving).reason
  );

  return (
    <Link
      href={`/destinations/${country.slug}`}
      className="group flex flex-col rounded-2xl border border-separator bg-surface p-6 no-underline
        transition-colors duration-200 motion-reduce:transition-none hover:bg-bg-grouped
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      <h3 className="font-ui text-xl font-semibold text-label group-hover:underline">
        {country.name}
      </h3>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-label-3">Region</dt>
          <dd className="text-label">{country.region}</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-label-3">Cost band</dt>
          <dd className="flex flex-wrap items-center gap-2 text-label">
            {COST_BAND[country.costBand] ?? country.costBand}
            {costBandUnverified ? (
              <Unverified
                reason={splitUnverified(country.living.costOfLiving).reason}
              />
            ) : null}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-label-3">Guides</dt>
          <dd className="font-data tabular-nums text-label">
            {programCount === 0 ? "None yet" : programCount}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
