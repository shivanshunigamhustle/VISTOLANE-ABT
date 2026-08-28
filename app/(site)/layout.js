import "@/styles/tokens.css";
import "@/styles/globals.css";

export const metadata = {
  title: "Vistolane",
  description: "Immigration guidance, country by country.",
};

/**
 * Root layout.
 *
 * This is the application's only root layout — there is deliberately no
 * app/layout.js. Next.js treats the layout inside the (site) route group as the
 * root when no layout sits above it, so this file owns <html> and <body>.
 *
 * Import order matters: tokens.css declares the custom properties, then
 * globals.css pulls in Tailwind and maps those properties onto utilities.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function SiteLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-ui text-label antialiased">
        {/*
          Skip link. It is parked just above the viewport rather than clipped,
          so it keeps its real box and slides into place on focus. Only the
          transform changes, which avoids the padding that `not-sr-only` would
          otherwise strip at focus time.
        */}
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-50 -translate-y-20 rounded-md border border-separator bg-surface px-4 py-2 text-label underline underline-offset-2 transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
