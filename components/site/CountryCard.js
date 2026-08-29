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
  // An unknown band has no label to show — the chip is the whole answer. A known
  // band still shows the chip while the record's cost-of-living field is flagged,
  // because the band is an editorial call rather than an official figure.
  const bandIsUnknown = country.costBand === "unknown";
  const costReason = splitUnverified(country.living.costOfLiving).reason;

  return (
    <Link
      href={`/destinations/${country.slug}`}
      className="surface-raised group flex flex-col p-6 no-underline
        transition-shadow duration-200 motion-reduce:transition-none
        hover:shadow-[0_2px_4px_rgb(0_0_0/0.06),0_8px_24px_rgb(0_0_0/0.08)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      <h3 className="t-subsection text-label group-hover:underline">
        {country.name}
      </h3>

      <dl className="t-data mt-4 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-label-3">Region</dt>
          <dd className="text-label">{country.region}</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="text-label-3">Cost band</dt>
          <dd className="flex flex-wrap items-center gap-2 text-label">
            {bandIsUnknown
              ? null
              : (COST_BAND[country.costBand] ?? country.costBand)}
            {bandIsUnknown || costReason ? (
              <Unverified reason={costReason} />
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
