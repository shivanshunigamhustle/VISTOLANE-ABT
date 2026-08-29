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
    src: null,
    width: 1600,
    height: 1040,
    alt: null,
    note: "Hero — full bleed, right two-thirds",
  },
  consultation: {
    src: null,
    width: 900,
    height: 1100,
    alt: null,
    note: "Consultation band — left third",
  },
  "destination:canada": {
    src: null,
    width: 800,
    height: 600,
    alt: null,
    note: "Canada — 4:3",
  },
  "destination:australia": {
    src: null,
    width: 800,
    height: 600,
    alt: null,
    note: "Australia — 4:3",
  },
  "destination:germany": {
    src: null,
    width: 800,
    height: 600,
    alt: null,
    note: "Germany — 4:3",
  },
  "destination:united-kingdom": {
    src: null,
    width: 800,
    height: 600,
    alt: null,
    note: "United Kingdom — 4:3",
  },
  "destination:vietnam": {
    src: null,
    width: 800,
    height: 600,
    alt: null,
    note: "Vietnam — 4:3",
  },
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
