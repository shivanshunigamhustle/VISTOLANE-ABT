"use client";

import { useEffect, useState } from "react";

/**
 * In-page contents.
 *
 * A sticky rail beside the content on xl screens, a collapsed disclosure below
 * it. The disclosure is a <details>, so it opens without JavaScript exactly as
 * the site navigation does.
 *
 * The active-section marker is the one part that needs JavaScript. It is
 * progressive enhancement: with scripting off every link still resolves, nothing
 * is hidden, and the only thing missing is the highlight.
 */

/**
 * @param {{ headings: import("@/lib/content/toc").TocHeading[], activeId: string | null }} props
 * @returns {JSX.Element}
 */
function TocList({ headings, activeId }) {
  return (
    <ol className="space-y-0.5">
      {headings.map((heading) => {
        const active = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active ? "location" : undefined}
              className={`color-transition block border-l py-1.5 pl-3 font-ui text-[0.8125rem] leading-snug no-underline
                hover:text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint
                ${
                  active
                    ? "border-label font-medium text-label"
                    : "border-rule text-label-2"
                }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * @param {{
 *   headings: import("@/lib/content/toc").TocHeading[],
 *   label?: string,
 * }} props
 * @returns {JSX.Element | null}
 */
export default function Toc({ headings, label = "On this page" }) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!headings || headings.length === 0) return undefined;
    if (typeof IntersectionObserver === "undefined") return undefined;

    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean);
    if (targets.length === 0) return undefined;

    const seen = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          seen.set(entry.target.id, entry.isIntersecting);
        }
        const firstVisible = headings.find((heading) => seen.get(heading.id));
        if (firstVisible) setActiveId(firstVisible.id);
      },
      // Bias the band towards the top of the viewport, so the marker follows the
      // heading being read rather than whatever is lowest on screen.
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  return (
    <>
      <nav
        aria-label={label}
        className="hidden xl:sticky xl:top-10 xl:block xl:self-start"
      >
        <p className="t-eyebrow mb-4">{label}</p>
        <TocList headings={headings} activeId={activeId} />
      </nav>

      <details className="border-y border-rule py-4 xl:hidden">
        <summary className="t-subsection cursor-pointer text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint">
          {label}
        </summary>
        <div className="disclose-content mt-4">
          <TocList headings={headings} activeId={activeId} />
        </div>
      </details>
    </>
  );
}
