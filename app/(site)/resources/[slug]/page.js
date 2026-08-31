import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

import Prose from "@/components/primitives/Prose";
import JsonLd from "@/components/site/JsonLd";
import PageMasthead from "@/components/site/PageMasthead";
import SoftBridge from "@/components/site/SoftBridge";
import { getIntent } from "@/lib/content/intents";
import { getAllGuides, getAllPrograms, getGuide } from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { article, breadcrumbList } from "@/lib/seo/schema";

/**
 * @returns {Promise<Array<{ slug: string }>>}
 */
export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

/**
 * @param {{ params: Promise<{ slug: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};

  return pageMetadata({
    title: `${guide.title} | Vistolane`,
    description: guide.standfirst,
    path: `/resources/${guide.slug}`,
    type: "article",
  });
}

/**
 * @param {{ params: Promise<{ slug: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const allPrograms = await getAllPrograms();
  const related = guide.relatedPrograms
    .map((programSlug) => allPrograms.find((p) => p.slug === programSlug))
    .filter(Boolean);

  const intentLabel = guide.intent ? getIntent(guide.intent)?.label : null;
  const path = `/resources/${guide.slug}`;

  return (
    <main id="main-content">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/resources" },
          { name: guide.title, path },
        ])}
      />
      <JsonLd
        schema={article({
          title: guide.title,
          description: guide.standfirst,
          path,
          lastReviewed: guide.lastReviewed,
          author: guide.author,
        })}
      />

      <PageMasthead
        eyebrow={intentLabel ?? "Cross-route guide"}
        title={guide.title}
        standfirst={guide.standfirst}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/resources" },
          { label: guide.title },
        ]}
        stats={[
          { label: "Reading time", value: `${guide.readingTime} min` },
          { label: "Author", value: guide.author.name },
          { label: "Last reviewed", value: guide.lastReviewed },
        ]}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <Prose>
            <MDXRemote
              source={guide.body}
              options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
            />
          </Prose>

          <div className="mt-10 border-t border-rule pt-6">
            <h2 className="t-eyebrow mb-3">Sources</h2>
            <ul className="space-y-1.5">
              {guide.sources.map((source) => (
                <li key={source.url} className="text-sm">
                  <a
                    href={source.url}
                    className="link-accent [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                  >
                    {source.label}
                  </a>{" "}
                  <span className="text-label-2">
                    · retrieved {source.retrieved}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside>
          {related.length > 0 ? (
            <div>
              <h2 className="t-eyebrow mb-3">Related programmes</h2>
              <ul className="space-y-2">
                {related.map((program) => (
                  <li key={program.slug}>
                    <Link
                      href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
                      className="color-transition text-sm text-label no-underline hover:text-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {program.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-6 text-sm">
            <Link
              href="/resources"
              className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              All guides
            </Link>
          </p>
        </aside>
      </div>

      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <SoftBridge intent={guide.intent} intentLabel={intentLabel} />
        </div>
      </div>
    </main>
  );
}
