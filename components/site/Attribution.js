"use client";

import { useEffect } from "react";

/**
 * First-touch attribution capture.
 *
 * These pages are statically generated, so a visitor's utm_* parameters are not
 * in the HTML and never can be — anything that tries to read them on the server
 * finds nothing, silently, and the client never learns that their spend is not
 * being attributed. So the capture happens in the browser, once, and is read
 * back by the bridge components at hydration.
 *
 * FIRST touch, not last. Someone who arrives on a country guide from an ad and
 * then reads three programme pages before converting must still carry that ad's
 * attribution at the point of conversion. Overwriting the record on every page
 * view would replace the campaign that earned the visit with the internal link
 * that happened to be last, which destroys exactly the signal being paid for.
 * That is why the write is guarded on the key being absent.
 */

/** One key, so the whole record is written and read atomically. */
const STORAGE_KEY = "vistolane:attribution";

/** Query parameters worth keeping. */
const TRACKED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
];

/**
 * Capture the first touch, if it has not been captured already.
 *
 * Safe to call any number of times and from anywhere: it writes only when the
 * key is absent, and it swallows storage failures. Private browsing, disabled
 * site data and sandboxed frames all make sessionStorage throw rather than
 * return null, and none of those should break a link.
 *
 * @returns {void}
 */
export function captureFirstTouch() {
  if (typeof window === "undefined") return;

  try {
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    /** @type {Record<string, string>} */
    const record = {};

    for (const name of TRACKED_PARAMS) {
      const value = params.get(name);
      if (value) record[name] = value;
    }
    if (document.referrer) record.referrer = document.referrer;
    record.landing = window.location.pathname;

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage is unavailable. Attribution is enrichment, never a precondition —
    // the links still work without it.
  }
}

/**
 * Read the captured first touch.
 *
 * Calls the capture first, so the result does not depend on component order.
 * React runs child effects before parent effects, which means a bridge deep in
 * the page would otherwise read storage before the layout-level capture had run
 * and miss attribution on the landing page itself.
 *
 * @returns {Record<string, string>} The record, or {} when there is nothing to read.
 */
export function readAttribution() {
  if (typeof window === "undefined") return {};

  captureFirstTouch();

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

/**
 * Mounted once in the site layout. Renders nothing.
 *
 * @returns {null}
 */
export default function Attribution() {
  useEffect(() => {
    captureFirstTouch();
  }, []);

  return null;
}
