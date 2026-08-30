import Link from "next/link";

import AttributedLink from "@/components/site/AttributedLink";
import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import SectionHeading from "@/components/site/SectionHeading";
import { eligibilityPath } from "@/lib/bridge";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

/**
 * The tools index.
 *
 * Every tool listed here is real — either a built page on this site or the
 * application's own eligibility checker, linked with attribution. None of
 * them is a "coming soon" placeholder card; a tool that does not exist yet
 * does not appear here at all.
 */

const TITLE = "Tools";
const DESCRIPTION =
  "Practical tools for comparing routes, once you already know roughly where you are headed.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/tools",
});

const TOOLS = [
  {
    name: "Check your eligibility",
    body: "Answer a few questions and see which routes may fit. No account needed.",
    external: true,
  },
  {
    name: "Processing times",
    body: "Compare current published timescales across every route, side by side.",
    href: "/tools/processing-times",
  },
  {
    name: "Document checklist",
    body: "Every document a route requires, grouped by whether it is required or optional. Printable.",
    href: "/tools/document-checklist",
  },
  {
    name: "Cost estimator",
    body: "Government fees for a chosen route, totalled, with what could not be confirmed shown separately.",
    href: "/tools/cost-estimator",
  },
];

export default function ToolsIndexPage() {
  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/tools" },
        ])}
      />

      <PageMasthead
        eyebrow="Practical"
        title={TITLE}
        standfirst={DESCRIPTION}
        breadcrumb={[{ label: "Home", href: "/" }, { label: TITLE }]}
      />

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <SectionHeading eyebrow="Every tool on the site">
          Pick a tool
        </SectionHeading>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <li key={tool.name} className="surface-raised flex flex-col p-6">
              <h2 className="t-subsection text-label">{tool.name}</h2>
              <p className="t-body mt-2 flex-1 text-label-2">{tool.body}</p>
              <p className="mt-4">
                {tool.external ? (
                  <AttributedLink
                    path={eligibilityPath() || undefined}
                    source="tools-index"
                    className="font-ui text-sm link-accent
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    Open the checker
                  </AttributedLink>
                ) : (
                  <Link
                    href={tool.href}
                    className="font-ui text-sm link-accent
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    Open the tool
                  </Link>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
