"use client";

import { useEffect, useState } from "react";

/**
 * A thin bar at the top of the viewport reporting how far down the page the
 * reader has scrolled. Within the motion rule on purpose: it reports scroll
 * position, which the reader caused, rather than animating on its own.
 *
 * Progressive enhancement — the page is fully readable and navigable with it
 * absent, it just adds a passive indicator for a 2,500+ word reference page.
 *
 * @param {{ hue: string }} props
 * @returns {JSX.Element}
 */
export default function ReadingProgress({ hue }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-50 h-[3px] motion-reduce:hidden"
      style={{ backgroundColor: "var(--color-fill)" }}
    >
      <div
        className="h-full"
        style={{ width: `${progress}%`, backgroundColor: hue }}
      />
    </div>
  );
}
