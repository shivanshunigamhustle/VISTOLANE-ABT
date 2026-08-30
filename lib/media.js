/**
 * The photography manifest.
 *
 * The client supplies the imagery. Every slot is declared here with `src: null`
 * until an asset lands; filling one in is a one-line edit to this file and
 * nothing else in the codebase mentions an image path.
 *
 * `alt` is content, not decoration, and must come from whoever supplies the
 * photograph — a description invented here would be a caption nobody wrote.
 * `Media` refuses to render an <img> without one.
 *
 * TODO(OPN-09): client to supply hero, consultation and per-country imagery,
 * each with alt text. Until then every slot renders a labelled placeholder at
 * exactly the final dimensions, so the layout being reviewed is the real one.
 *
 * @typedef {Object} MediaAsset
 * @property {string | null} src
 * @property {number} width
 * @property {number} height
 * @property {string | null} alt
 * @property {string} note  What this slot is, shown on the placeholder.
 */

/** @type {Record<string, MediaAsset>} */
export const MEDIA = {
  hero: {
    src: "/images/hero.jpg",
    width: 1536,
    height: 1024,
    alt: "Toronto skyline and waterfront at dusk, with the CN Tower at the centre.",
    note: "Hero: full bleed, right two-thirds",
  },
  consultation: {
    src: "/images/consultation.jpg",
    width: 900,
    height: 1101,
    alt: "A person reviewing documents and a laptop at a desk.",
    note: "Consultation band: left third",
  },
  "destination:canada": {
    src: "/images/destinations/canada.jpg",
    width: 800,
    height: 600,
    alt: "Toronto skyline viewed from the waterfront at sunset, with the CN Tower at the centre.",
    note: "Canada: 4:3",
  },
  "destination:australia": {
    src: "/images/destinations/australia.jpg",
    width: 800,
    height: 600,
    alt: "Sydney Harbour Bridge and city skyline at sunset, with the Opera House visible on the right.",
    note: "Australia: 4:3",
  },
  "destination:germany": {
    src: "/images/destinations/germany.jpg",
    width: 800,
    height: 600,
    alt: "Berlin's Fernsehturm television tower and the Berlin Cathedral along the river Spree at dusk.",
    note: "Germany: 4:3",
  },
  "destination:united-kingdom": {
    src: "/images/destinations/united-kingdom.jpg",
    width: 800,
    height: 600,
    alt: "London's Shard and the City skyline along the River Thames at dusk.",
    note: "United Kingdom: 4:3",
  },
  "destination:vietnam": {
    src: "/images/destinations/vietnam.jpg",
    width: 800,
    height: 600,
    alt: "Ho Chi Minh City skyline along the Saigon River at dusk, with the Bitexco Financial Tower at the centre-left.",
    note: "Vietnam: 4:3",
  },
};

/**
 * Client-supplied flag artwork, cropped from a single composite image into
 * one square per country. Keyed by country slug rather than iso2 because the
 * United Kingdom's file is named for brevity, not for its code. Shared by
 * every card that shows a flag badge — DestinationPhotoCard and CountryCard —
 * so the two surfaces cannot drift onto different artwork for the same
 * country.
 *
 * @type {Record<string, string>}
 */
export const FLAG_IMAGE = {
  canada: "/images/flags/canada.jpg",
  australia: "/images/flags/australia.jpg",
  germany: "/images/flags/germany.jpg",
  "united-kingdom": "/images/flags/uk.jpg",
  vietnam: "/images/flags/vietnam.jpg",
};

/**
 * @param {string} slot
 * @returns {MediaAsset}
 */
export function asset(slot) {
  return (
    MEDIA[slot] ?? {
      src: null,
      width: 800,
      height: 600,
      alt: null,
      note: slot,
    }
  );
}
