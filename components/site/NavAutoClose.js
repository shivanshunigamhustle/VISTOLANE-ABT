"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Closes any open header <details> dropdown on navigation or on scroll.
 *
 * The dropdowns themselves (SiteHeader's NavGroup) are plain <details>
 * elements specifically so they open and close with JavaScript off. This
 * component only tidies them up afterwards — it is pure enhancement, never
 * the mechanism. Two problems it fixes:
 *
 *  - The header lives in the root layout, so it is not remounted between
 *    client-side navigations. A <details> left open when a link inside it
 *    was clicked stayed open on the new page, because its open state is
 *    native DOM state that a route change does not reset on its own.
 *  - A dropdown left open while the reader scrolls the page keeps floating
 *    over content that has scrolled underneath it.
 *
 * Renders nothing; it only ever reads and closes <details> elements it does
 * not own.
 *
 * @returns {null}
 */
export default function NavAutoClose() {
  const pathname = usePathname();

  useEffect(() => {
    const closeOpenDropdowns = () => {
      document
        .querySelectorAll("header details[open]")
        .forEach((el) => el.removeAttribute("open"));
    };

    closeOpenDropdowns();

    window.addEventListener("scroll", closeOpenDropdowns, { passive: true });
    return () => window.removeEventListener("scroll", closeOpenDropdowns);
  }, [pathname]);

  return null;
}
