import Link from "next/link";

import JsonLd from "@/components/site/JsonLd";
import { getAllNewsUpdates } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList } from "@/lib/seo/schema";

const TITLE = "News";
const DESCRIPTION =
  "Policy changes that affect the routes on this site, dated to when they took effect.";

export const metadata = pageMetadata({
  title: `${TITLE} | Vistolane`,
  description: DESCRIPTION,
  path: "/news",
});

export default async function NewsIndexPage() {
  const updates = await getAllNewsUpdates();

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/news" },
        ])}
      />

      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-14">
          <p className="t-eyebrow text-on-brand opacity-70">Updates</p>
          <h1 className="t-page-title mt-6 text-on-brand">{TITLE}</h1>
          <p className="t-lede mt-5 max-w-[60ch] text-on-brand opacity-85">
            {DESCRIPTION}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        {updates.length === 0 ? (
          <p className="t-body text-label-2">No updates yet.</p>
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {updates.map((update) => (
              <li key={update.slug} className="py-6">
                <Link
                  href={`/news/${update.slug}`}
                  className="group block no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                >
                  <time className="t-data text-xs text-label-2">
                    Effective {update.effectiveDate}
                  </time>
                  <h2 className="t-subsection mt-1.5 text-label group-hover:underline">
                    {update.title}
                  </h2>
                  <p className="mt-2 max-w-[68ch] font-read text-sm text-label-2">
                    {update.body.slice(0, 220)}
                    {update.body.length > 220 ? "…" : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
