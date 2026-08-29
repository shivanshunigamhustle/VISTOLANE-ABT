"use client";

import { useEffect, useState } from "react";

import { readAttribution } from "@/components/site/Attribution";
import { buildPortalUrl } from "@/lib/bridge";

/**
 * A link into the application that carries first-touch attribution.
 *
 * Same contract as the bridge components: the href is complete on the server,
 * and attribution is layered on at hydration. With JavaScript off the link still
 * goes to the right place, just without the utm data.
 *
 * @param {{
 *   path?: string,
 *   source: string,
 *   country?: string,
 *   intent?: string,
 *   className?: string,
 *   children: React.ReactNode,
 * }} props
 * @returns {JSX.Element}
 */
export default function AttributedLink({
  path,
  source,
  country,
  intent,
  className = "",
  children,
}) {
  const [attribution, setAttribution] = useState(null);

  useEffect(() => {
    setAttribution(readAttribution());
  }, []);

  const href = buildPortalUrl({
    path,
    country,
    intent,
    source,
    attribution: attribution ?? undefined,
  });

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
