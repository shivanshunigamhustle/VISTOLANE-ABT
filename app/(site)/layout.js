import "@/styles/tokens.css";
import "@/styles/globals.css";

import Attribution from "@/components/site/Attribution";
import NavAutoClose from "@/components/site/NavAutoClose";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import UtilityBar from "@/components/site/UtilityBar";
import { getAllCountries, getAllPrograms } from "@/lib/content/loader";
import { formatReviewDate, latestReview } from "@/lib/content/provenance";
import { SITE_NAME, siteUrl } from "@/lib/seo/metadata";

export const metadata = {
  // Resolves any relative URL Next emits (OpenGraph, canonicals) against the
  // real origin. Pages set their own absolute canonical on top of this.
  metadataBase: siteUrl() ? new URL(siteUrl()) : undefined,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "A clear path to your next move abroad.",
};

/**
 * Root layout.
 *
 * This is the application's only root layout for the public site — there is
 * deliberately no app/layout.js. Next.js treats the layout inside the (site)
 * route group as the root when no layout sits above it, so this file owns
 * <html> and <body>.
 *
 * Import order matters: tokens.css declares the custom properties, then
 * globals.css pulls in Tailwind and maps those properties onto utilities.
 *
 * Header and footer live here so every route in the group carries them. Each
 * page supplies its own <main id="main-content">, which is what the skip link
 * targets.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function SiteLayout({ children }) {
  const [countries, programs] = await Promise.all([
    getAllCountries(),
    getAllPrograms(),
  ]);
  const reviewedLabel = formatReviewDate(
    latestReview([...countries, ...programs])
  );

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-bg font-ui text-label antialiased">
        {/*
          Skip link. It is parked just above the viewport rather than clipped,
          so it keeps its real box and slides into place on focus. Only the
          transform changes, which avoids the padding that `not-sr-only` would
          otherwise strip at focus time.
        */}
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 -translate-y-20 rounded-control border border-separator bg-surface px-4 py-2 text-label underline underline-offset-2 transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>

        {/* Captures first-touch attribution once per session. Renders nothing. */}
        <Attribution />

        <UtilityBar reviewedLabel={reviewedLabel} />
        <SiteHeader />
        <NavAutoClose />

        <div className="flex-1">{children}</div>

        <SiteFooter />
      </body>
    </html>
  );
}
