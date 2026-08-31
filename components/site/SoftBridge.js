"use client";

import { useEffect, useState } from "react";

import Button from "@/components/primitives/Button";
import { readAttribution } from "@/components/site/Attribution";
import { buildPortalUrl, eligibilityPath } from "@/lib/bridge";

/**
 * The low-commitment entry point into the application.
 *
 * The application's eligibility checker needs no account, which makes it the
 * cheapest thing we can ask of someone who is still deciding — so the copy says
 * so plainly rather than implying a sign-up.
 *
 * As with ProgramBridge, the href is complete without JavaScript and attribution
 * is added at hydration. Where NEXT_PUBLIC_PORTAL_ELIGIBILITY_PATH is not
 * configured the link degrades to the application's default entry path rather
 * than to a guessed checker URL (OPN-07).
 *
 * `tone="flat"` is the same light colours as "plain" without the
 * surface-raised card — for a layout that already gives this its own visual
 * (a preview card, an illustration) beside it, where a second card would be
 * redundant. Every other call site stands alone and keeps the card.
 *
 * @param {{
 *   country?: string,
 *   intent?: string,
 *   intentLabel?: string,
 *   tone?: "ink" | "plain" | "flat",
 * }} props
 * @returns {JSX.Element}
 */
export default function SoftBridge({
  country,
  intent,
  intentLabel,
  tone = "plain",
}) {
  const [attribution, setAttribution] = useState(null);

  useEffect(() => {
    setAttribution(readAttribution());
  }, []);

  const configuredPath = eligibilityPath();
  const href = buildPortalUrl({
    path: configuredPath || undefined,
    country,
    intent,
    source: "soft-bridge",
    attribution: attribution ?? undefined,
  });

  const onInk = tone === "ink";
  const boxed = tone === "plain";
  const heading = intentLabel
    ? `Check if you qualify to ${intentLabel.toLowerCase()}`
    : "Check if you qualify";

  return (
    <aside className={boxed ? "surface-raised p-8 sm:p-10" : ""}>
      <p className={`t-eyebrow ${onInk ? "text-on-brand opacity-70" : ""}`}>
        Before you commit
      </p>
      <h2
        className={`t-section mt-3 ${onInk ? "text-on-brand" : "text-label"}`}
      >
        {heading}
      </h2>
      <p
        className={`t-body mt-4 ${onInk ? "text-on-brand opacity-85" : "text-label-2"}`}
      >
        The eligibility checker asks a few questions and tells you which routes
        you may be able to use. You do not need an account, and you are not
        applying for anything by using it.
      </p>
      <div className="mt-7">
        <Button href={href} variant={onInk ? "primaryInk" : "primary"}>
          Check if you qualify
        </Button>
      </div>
    </aside>
  );
}
