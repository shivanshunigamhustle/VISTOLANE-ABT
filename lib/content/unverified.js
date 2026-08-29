/**
 * The "Verify before publish" marker, and how to split a field on it.
 *
 * This lives apart from the component that renders the chip so that anything
 * needing the text — metadata descriptions, JSON-LD, a sitemap — can strip a
 * marker without importing React.
 */

export const UNVERIFIED_MARKER = "Verify before publish";

/**
 * Split a field into the part that was confirmed and the reason it was not.
 *
 * @param {unknown} value
 * @returns {{ text: string | null, reason: string | null }}
 */
export function splitUnverified(value) {
  if (typeof value !== "string") {
    return {
      text: value === null || value === undefined ? null : String(value),
      reason: null,
    };
  }

  const index = value.indexOf(UNVERIFIED_MARKER);
  if (index === -1) return { text: value, reason: null };

  const text = value
    .slice(0, index)
    .trim()
    .replace(/[—–-]\s*$/u, "")
    .trim();
  const reason = value
    .slice(index + UNVERIFIED_MARKER.length)
    .trim()
    .replace(/^[—–-]\s*/u, "")
    .trim();

  return { text: text || null, reason: reason || null };
}

/**
 * Only the confirmed part of a field, or an empty string when none of it is.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function confirmedText(value) {
  return splitUnverified(value).text ?? "";
}
