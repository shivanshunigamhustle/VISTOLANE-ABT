import Link from "next/link";

/**
 * A country on the destination grid.
 *
 * The card answers two questions and stops: where is this, and is there anything
 * here to read. The guide count is the card's data point and is set as a figure;
 * everything else is quiet.
 *
 * Cost band is deliberately absent. It is an editorial classification the
 * research does not yet support, and an unverified field does not belong on a
 * summary card — it belongs on the country page, where it can carry its caveat.
 * Putting it here meant four "Not yet verified" chips on a grid of five.
 *
 * @param {{
 *   country: import("@/lib/content/schema").Country,
 *   programCount: number,
 * }} props
 * @returns {JSX.Element}
 */
export default function CountryCard({ country, programCount }) {
  return (
    <Link
      href={`/destinations/${country.slug}`}
      className="surface-raised group flex h-full flex-col justify-between gap-8 p-6 no-underline
        transition-shadow duration-200 motion-reduce:transition-none
        hover:shadow-[0_2px_4px_rgb(0_0_0/0.06),0_8px_24px_rgb(0_0_0/0.08)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      <div>
        <h3 className="font-read text-[1.375rem] font-semibold leading-tight text-label group-hover:underline">
          {country.name}
        </h3>
        <p className="mt-1.5 font-ui text-[0.9375rem] text-label-2">
          {country.region}
        </p>
      </div>

      {/*
        Every card has the same anatomy: figure, eyebrow, then a quiet line. The
        zero state fills the figure slot with an em dash rather than leaving a
        hole, so a grid of mostly-empty countries still reads as a grid.
      */}
      <div>
        <p
          className={`t-figure ${programCount === 0 ? "text-label-2" : "text-label"}`}
        >
          {programCount === 0 ? "—" : programCount}
        </p>
        <p className="t-eyebrow mt-1.5">
          {programCount === 1 ? "route guide" : "route guides"}
        </p>
        {programCount === 0 ? (
          <p className="mt-2 font-ui text-[0.9375rem] text-label-2">
            No guides yet
          </p>
        ) : null}
      </div>
    </Link>
  );
}
