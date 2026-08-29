import Link from "next/link";

import CountryMark from "@/components/site/CountryMark";
import Media from "@/components/site/Media";
import { FLAG_IMAGE } from "@/lib/media";

/**
 * A destination as a photo card, for the home page.
 *
 * Deliberately a different component from CountryCard rather than a variant of
 * it. The grid at /destinations is a comparison surface and keeps its data-led
 * card — region, guide count, an honest em dash where a country has nothing yet.
 * This one is a browse surface and leads with the photograph.
 *
 * The chip carries the flag artwork for the record. Where no crop exists yet
 * for a slug, it falls back to the ISO 3166-1 alpha-2 code as plain text
 * rather than rendering a broken image.
 *
 * The hover lift is .lift-card from the motion system (styles/globals.css).
 *
 * @param {{
 *   country: import("@/lib/content/schema").Country,
 *   programCount: number,
 * }} props
 * @returns {JSX.Element}
 */
export default function DestinationPhotoCard({ country, programCount }) {
  return (
    <Link
      href={`/destinations/${country.slug}`}
      className="lift-card group block w-[16rem] shrink-0 no-underline sm:w-auto
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      <Media
        slot={`destination:${country.slug}`}
        className="aspect-[4/3] w-full rounded-media"
        fallback={
          <CountryMark countrySlug={country.slug} label={country.name} />
        }
      >
        {/*
          The caption sits on a SOLID brand-ink ground, with a short gradient
          above it doing the transition. A fade alone cannot guarantee contrast:
          measured against the placeholder the name came out at 1.19:1, and with
          an unknown client photograph behind it there is no value that is safe.
          A solid ground is 17.7:1 whatever the image turns out to be.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-[4.5rem] h-16"
          style={{
            background:
              "linear-gradient(to top, var(--color-brand-ink) 0%, color-mix(in srgb, var(--color-brand-ink) 55%, transparent) 55%, transparent 100%)",
          }}
        />

        <span
          role="img"
          aria-label={country.iso2}
          title={country.iso2}
          className="absolute left-3 top-3 flex size-8 items-center justify-center overflow-hidden rounded-pill bg-on-brand shadow-[0_1px_2px_rgb(0_0_0/0.12)]"
        >
          {FLAG_IMAGE[country.slug] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={FLAG_IMAGE[country.slug]}
              alt=""
              className="size-full scale-[2] object-cover"
            />
          ) : (
            <span className="font-data text-[0.6875rem] font-semibold uppercase tracking-wide text-brand-ink">
              {country.iso2}
            </span>
          )}
        </span>

        <span className="absolute inset-x-0 bottom-0 block min-h-[4.5rem] bg-brand-ink p-4">
          <span className="block font-read text-[1.25rem] font-semibold leading-tight text-on-brand group-hover:underline">
            {country.name}
          </span>
          <span className="mt-1 block font-ui text-[0.8125rem] text-on-brand/85">
            {programCount === 0
              ? "No guides yet"
              : `${programCount} ${programCount === 1 ? "guide" : "guides"}`}
          </span>
        </span>
      </Media>
    </Link>
  );
}
