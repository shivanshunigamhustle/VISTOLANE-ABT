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
 *   country: string,
 *   intent?: string,
 *   intentLabel?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function SoftBridge({ country, intent, intentLabel }) {
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

  return (
    <aside className="rounded-2xl border border-separator bg-bg-grouped p-6">
      <h2 className="font-ui text-lg font-semibold text-label">
        {intentLabel
          ? `Check if you qualify to ${intentLabel.toLowerCase()}`
          : "Check if you qualify"}
      </h2>
      <p className="mt-2 max-w-[68ch] font-read leading-relaxed text-label-2">
        The eligibility checker asks a few questions and tells you which routes
        you may be able to use. You do not need an account, and you are not
        applying for anything by using it.
      </p>
      <div className="mt-5">
        <Button href={href} variant="primary">
          Check if you qualify
        </Button>
      </div>
    </aside>
  );
}
