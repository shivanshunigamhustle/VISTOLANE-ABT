"use client";

import { useEffect, useState } from "react";

import Button from "@/components/primitives/Button";
import { readAttribution } from "@/components/site/Attribution";
import { buildPortalUrl } from "@/lib/bridge";

/**
 * The hand-off from a programme guide into the application.
 *
 * The href is complete on the server: country, intent and programme are all
 * known at build time, so this link works with JavaScript switched off and takes
 * the visitor to the right place. Attribution is layered on after hydration —
 * enrichment, never a precondition. If storage is empty or unavailable the link
 * is identical minus the utm data.
 *
 * @param {{ program: import("@/lib/content/schema").Program }} props
 * @returns {JSX.Element}
 */
export default function ProgramBridge({ program }) {
  const [attribution, setAttribution] = useState(null);

  useEffect(() => {
    setAttribution(readAttribution());
  }, []);

  const href = buildPortalUrl({
    country: program.countrySlug,
    intent: program.intent,
    program: program.slug,
    source: "program-page",
    attribution: attribution ?? undefined,
  });

  return (
    <div className="rounded-xl border border-separator bg-bg-grouped p-5">
      <Button href={href} variant="primary">
        Start your {program.name} application
      </Button>
    </div>
  );
}
