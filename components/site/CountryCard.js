import Link from "next/link";

import CountryMark from "@/components/site/CountryMark";
import Media from "@/components/site/Media";
import { INTENTS } from "@/lib/content/intents";
import { FLAG_IMAGE } from "@/lib/media";

/**
 * A country on the destination grid.
 *
 * A photo strip and flag badge lead the card — the same artwork
 * DestinationPhotoCard uses on the home page, via the same Media slot and
 * the same shared FLAG_IMAGE map, so a country never shows different
 * photography on two surfaces. Where no photo is configured for a slug,
 * Media falls back to CountryMark rather than a blank box or build-status
 * text.
 *
 * Below that it stays a data-led card and answers two questions: where is
 * this, and is there anything here to read. The guide count is the card's
 * data point and is set as a figure; everything else is quiet.
 *
 * The intent row at the foot is real navigation, not filler: each pill is
 * derived from this country's actual programme records (coveredIntents),
 * never invented, and a covered intent is a real link into that
 * country/intent pair. It sits outside the card's own <Link> — the whole
 * card is already one click target, and a link cannot nest inside a link.
 *
 * Cost band is deliberately absent. It is an editorial classification the
 * research does not yet support, and an unverified field does not belong on a
 * summary card — it belongs on the country page, where it can carry its caveat.
 * Putting it here meant four "Not yet verified" chips on a grid of five.
 *
 * @param {{
 *   country: import("@/lib/content/schema").Country,
 *   programCount: number,
 *   coveredIntents?: string[],
 * }} props
 * @returns {JSX.Element}
 */
export default function CountryCard({
  country,
  programCount,
  coveredIntents = [],
}) {
  const covered = new Set(coveredIntents);

  return (
    <article className="surface-raised flex h-full flex-col overflow-hidden">
      <Link
        href={`/destinations/${country.slug}`}
        className="lift-card group flex flex-1 flex-col no-underline
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
      >
        <Media
          slot={`destination:${country.slug}`}
          className="aspect-[16/9] w-full"
          fallback={
            <CountryMark countrySlug={country.slug} label={country.name} />
          }
        >
          {FLAG_IMAGE[country.slug] ? (
            <span
              role="img"
              aria-label={country.iso2}
              title={country.iso2}
              className="absolute left-3 top-3 flex size-8 items-center justify-center overflow-hidden rounded-pill bg-on-brand shadow-[0_1px_2px_rgb(0_0_0/0.12)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FLAG_IMAGE[country.slug]}
                alt=""
                className="size-full scale-[2] object-cover"
              />
            </span>
          ) : null}
        </Media>

        <div className="flex flex-1 flex-col justify-between gap-8 p-6 pb-4">
          <div>
            <h3 className="font-read text-[1.375rem] font-semibold leading-tight text-label group-hover:underline">
              {country.name}
            </h3>
            <p className="mt-1.5 font-ui text-[0.9375rem] text-label-2">
              {country.region}
            </p>
          </div>

          {/*
            Every card has the same anatomy: figure, eyebrow, then a quiet
            line. The zero state fills the figure slot with an em dash rather
            than leaving a hole, so a grid of mostly-empty countries still
            reads as a grid.
          */}
          <div>
            <p
              className={`t-figure ${programCount === 0 ? "text-label-2" : "text-label"}`}
            >
              {programCount === 0 ? "0" : programCount}
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
        </div>
      </Link>

      <ul
        aria-label={`Intents covered for ${country.name}`}
        className="flex flex-wrap gap-1.5 border-t border-rule p-4 pt-3"
      >
        {INTENTS.map((intent) =>
          covered.has(intent.slug) ? (
            <li key={intent.slug}>
              <Link
                href={`/destinations/${country.slug}/${intent.slug}`}
                className="color-transition inline-flex items-center gap-1.5 rounded-pill bg-fill px-2.5 py-1 font-ui text-[0.75rem] font-medium text-label no-underline hover:bg-separator focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `var(${intent.token})` }}
                />
                {intent.label}
              </Link>
            </li>
          ) : (
            <li key={intent.slug}>
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-ui text-[0.75rem] text-label-3"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(${intent.token}) 45%, transparent)`,
                  }}
                />
                {intent.label}
              </span>
            </li>
          )
        )}
      </ul>
    </article>
  );
}
