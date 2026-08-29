import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

import Badge from "@/components/primitives/Badge";
import Button from "@/components/primitives/Button";
import Callout from "@/components/primitives/Callout";
import DataTable from "@/components/primitives/DataTable";
import Prose from "@/components/primitives/Prose";
import Toc, { tocFromMdx } from "@/components/primitives/Toc";
import { INTENTS } from "@/lib/content/intents";
import { getProgram } from "@/lib/content/loader";

import InteractiveDemo from "./InteractiveDemo";

export const metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

/** @type {import("@/components/primitives/Badge").BadgeTone[]} */
const STATUS_TONES = ["neutral", "success", "warning", "danger"];

/**
 * Development-only gallery of every primitive in every variant.
 *
 * Content comes from the loader, not from fixtures, so the primitives are
 * exercised against the shapes they will actually receive — including the long
 * URLs and the unverified-field prose that real records carry.
 *
 * @returns {Promise<JSX.Element>}
 */
export default async function KitchenSinkPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const program = await getProgram("canada", "work", "lmia");
  if (!program) notFound();

  const headings = tocFromMdx(program.body);
  const bodyExcerpt = program.body.split("\n## ").slice(0, 2).join("\n## ");

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12">
      <header className="mb-12">
        <p className="font-data text-xs uppercase tracking-widest text-label-3">
          Development only
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Kitchen sink</h1>
        <p className="mt-3 max-w-prose text-label-2">
          Every primitive, rendered against a real record —{" "}
          <span className="font-medium text-label">{program.name}</span>. This
          route returns 404 in production.
        </p>
      </header>

      <div className="space-y-16">
        <section aria-labelledby="badge-heading" className="space-y-4">
          <h2 id="badge-heading" className="text-xl font-semibold">
            Badge
          </h2>
          <p className="max-w-prose text-sm text-label-2">
            The hue is in the fill and the dot. Text stays on --color-label,
            because the intent hues do not carry enough contrast for body text.
          </p>

          <div className="flex flex-wrap gap-2">
            {STATUS_TONES.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone[0].toUpperCase() + tone.slice(1)}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2" data-testid="intent-badges">
            {INTENTS.map((intent) => (
              <Badge key={intent.slug} tone={intent.slug}>
                {intent.label}
              </Badge>
            ))}
          </div>
        </section>

        <section aria-labelledby="button-heading" className="space-y-4">
          <h2 id="button-heading" className="text-xl font-semibold">
            Button
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary action</Button>
            <Button variant="tint">Tint action</Button>
            <Button variant="quiet">Quiet action</Button>
            <Button variant="tint" href="#badge-heading">
              Renders as a link
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <InteractiveDemo
          intents={INTENTS.map((intent) => ({
            slug: intent.slug,
            label: intent.label,
          }))}
        />

        <section aria-labelledby="table-heading" className="space-y-4">
          <h2 id="table-heading" className="text-xl font-semibold">
            DataTable
          </h2>
          <DataTable
            caption={`Fees — ${program.name}. An unconfirmed amount is null, never guessed.`}
            columns={[
              { key: "item", label: "Item" },
              { key: "amount", label: "Amount", align: "right", mono: true },
              { key: "payableBy", label: "Payable by" },
              { key: "note", label: "Note" },
            ]}
            rows={program.fees.map((fee) => ({
              item: fee.item,
              amount:
                fee.amount === null
                  ? "—"
                  : `${fee.amount.toLocaleString("en-CA")} ${fee.currency}`,
              payableBy: fee.payableBy,
              note: fee.note || "—",
            }))}
          />
          <DataTable
            caption="Documents"
            columns={[
              { key: "name", label: "Document" },
              { key: "required", label: "Required", align: "center" },
              { key: "note", label: "Note" },
            ]}
            rows={program.documents.map((document) => ({
              name: document.name,
              required: (
                <Badge tone={document.required ? "success" : "neutral"}>
                  {document.required ? "Required" : "Conditional"}
                </Badge>
              ),
              note: document.note || "—",
            }))}
          />
        </section>

        <section aria-labelledby="callout-heading" className="space-y-4">
          <h2 id="callout-heading" className="text-xl font-semibold">
            Callout
          </h2>
          <Callout tone="note" title="How this record is reviewed">
            {program.author.credentials}. Last reviewed {program.lastReviewed}.
          </Callout>
          <Callout tone="warning" title={program.pitfalls[0].title}>
            {program.pitfalls[0].detail}
          </Callout>
          <Callout tone="source" sources={program.sources} />
        </section>

        <section aria-labelledby="prose-heading" className="space-y-4">
          <h2 id="prose-heading" className="text-xl font-semibold">
            Prose and Toc
          </h2>
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_14rem]">
            <Prose>
              <MDXRemote
                source={bodyExcerpt}
                options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
              />
            </Prose>
            <Toc headings={headings} />
          </div>
        </section>
      </div>
    </main>
  );
}
