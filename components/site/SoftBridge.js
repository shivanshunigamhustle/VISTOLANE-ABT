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
 * @param {{
 *   country?: string,
 *   intent?: string,
 *   intentLabel?: string,
 *   tone?: "ink" | "plain",
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
  const heading = intentLabel
    ? `Check if you qualify to ${intentLabel.toLowerCase()}`
    : "Check if you qualify";

  return (
    <aside className={onInk ? "" : "border-y border-rule py-10"}>
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
        <Button href={href} variant={onInk ? "onInk" : "primary"}>
          Check if you qualify
        </Button>
      </div>
    </aside>
  );
}
