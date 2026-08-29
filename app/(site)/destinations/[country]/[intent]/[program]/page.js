import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

import Badge from "@/components/primitives/Badge";
import Callout from "@/components/primitives/Callout";
import DataTable from "@/components/primitives/DataTable";
import Prose from "@/components/primitives/Prose";
import Toc, { tocFromMdx } from "@/components/primitives/Toc";
import Unverified, {
  FieldValue,
  splitUnverified,
} from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import LeadForm from "@/components/site/LeadForm";
import ProgramBridge from "@/components/site/ProgramBridge";
import {
  getAllPrograms,
  getCountry,
  getIntent,
  getProgram,
  getPrograms,
} from "@/lib/content/loader";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbList, faqPage, howTo } from "@/lib/seo/schema";

/**
 * The program reference page.
 *
 * Section order follows the reference pattern deliberately: orientation, then
 * the action, then the detail in the sequence someone actually needs it —
 * whether they qualify, what to gather, what happens, what it costs, what goes
 * wrong. It is dense on purpose. This is a document to be consulted, not a
 * landing page to be scrolled.
 *
 * Every string on the page comes from the record or is a structural label. No
 * structured data is emitted here; prompt 9 owns that in one place, so the FAQs
 * are plain semantic disclosure elements for now.
 */

/** Section anchors, also used to build the contents list. */
const SECTIONS = [
  { id: "eligibility", label: "Eligibility" },
  { id: "documents", label: "Documents" },
  { id: "process", label: "Process" },
  { id: "fees", label: "Fees" },
  { id: "pitfalls", label: "Common pitfalls" },
  { id: "faqs", label: "Questions" },
  { id: "about", label: "About this route" },
  { id: "sources", label: "Sources" },
  { id: "related", label: "Related programs" },
];

/**
 * @returns {Promise<Array<{ country: string, intent: string, program: string }>>}
 */
export async function generateStaticParams() {
  const programs = await getAllPrograms();
  return programs.map((program) => ({
    country: program.countrySlug,
    intent: program.intent,
    program: program.slug,
  }));
}

/**
 * @param {{ params: Promise<{ country: string, intent: string, program: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { country, intent, program: slug } = await params;
  const program = await getProgram(country, intent, slug);
  if (!program) return {};

  const [countryRecord, intentRecord] = await Promise.all([
    getCountry(program.countrySlug),
    getIntent(program.intent),
  ]);

  const countryName = countryRecord?.name ?? program.countrySlug;
  const intentLabel = intentRecord?.label ?? program.intent;
  const { text } = splitUnverified(program.whoItsFor);

  return pageMetadata({
    title: `${program.name} — ${countryName} ${intentLabel} | Vistolane`,
    description: text ?? program.officialName,
    path: `/destinations/${program.countrySlug}/${program.intent}/${program.slug}`,
    type: "article",
  });
}

/**
 * @param {{ params: Promise<{ country: string, intent: string, program: string }> }} props
 * @returns {Promise<JSX.Element>}
 */
export default async function ProgramPage({ params }) {
  const { country, intent, program: slug } = await params;

  const program = await getProgram(country, intent, slug);
  if (!program) notFound();

  const [countryRecord, intentRecord, siblings] = await Promise.all([
    getCountry(program.countrySlug),
    getIntent(program.intent),
    getPrograms({ country: program.countrySlug }),
  ]);

  const countryName = countryRecord?.name ?? program.countrySlug;
  const intentLabel = intentRecord?.label ?? program.intent;

  const pagePath = `/destinations/${program.countrySlug}/${program.intent}/${program.slug}`;
  const bodyHeadings = tocFromMdx(program.body);
  const contents = [
    ...SECTIONS.map((section) => ({ id: section.id, text: section.label })),
    ...bodyHeadings,
  ];

  const related = program.relatedPrograms.map((relatedSlug) => ({
    slug: relatedSlug,
    record:
      siblings.find((candidate) => candidate.slug === relatedSlug) ?? null,
  }));

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-5 py-10">
      <JsonLd
        schema={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Destinations", path: "/destinations" },
          { name: countryName, path: `/destinations/${program.countrySlug}` },
          {
            name: intentLabel,
            path: `/destinations/${program.countrySlug}/${program.intent}`,
          },
          { name: program.name, path: pagePath },
        ])}
      />
      <JsonLd schema={faqPage(program)} />
      <JsonLd schema={howTo(program, pagePath)} />

      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-label-2">
          {[
            { href: "/destinations", label: "Destinations" },
            {
              href: `/destinations/${program.countrySlug}`,
              label: countryName,
            },
            {
              href: `/destinations/${program.countrySlug}/${program.intent}`,
              label: intentLabel,
            },
          ].map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <Link
                href={crumb.href}
                className="underline underline-offset-2 hover:text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
              >
                {crumb.label}
              </Link>
              <span aria-hidden="true" className="text-label-3">
                /
              </span>
            </li>
          ))}
          <li aria-current="page" className="text-label">
            {program.name}
          </li>
        </ol>
      </nav>

      {/* 2. Title, official name, standfirst */}
      <header>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          {program.name}
        </h1>
        <p className="mt-2 font-read text-lg text-label-2">
          {program.officialName}
        </p>
        <p className="mt-4 max-w-[68ch] font-read text-lg leading-relaxed text-label">
          <FieldValue value={program.whoItsFor} />
        </p>
      </header>

      {/* 3. Meta strip */}
      <dl className="mt-8 grid gap-x-10 gap-y-5 border-y border-separator py-5 font-data text-sm tabular-nums sm:grid-cols-2">
        {[
          { label: "Processing time", value: program.processingTime },
          { label: "Validity", value: program.validity },
        ].map((entry) => (
          <div key={entry.label}>
            <dt className="font-ui text-xs uppercase tracking-wide text-label-3">
              {entry.label}
            </dt>
            <dd className="mt-1 text-label [overflow-wrap:anywhere]">
              <FieldValue value={entry.value} />
            </dd>
          </div>
        ))}
        <div>
          <dt className="font-ui text-xs uppercase tracking-wide text-label-3">
            Extendable
          </dt>
          <dd className="mt-1 text-label">
            {program.extendable ? "Yes" : "No"}
          </dd>
        </div>
        <div>
          <dt className="font-ui text-xs uppercase tracking-wide text-label-3">
            Intent
          </dt>
          <dd className="mt-1">
            <Badge tone={program.intent}>{intentLabel}</Badge>
          </dd>
        </div>
      </dl>

      {/* 4. Lead capture, immediately after the introduction */}
      <div className="mt-8">
        <LeadForm
          program={{
            slug: program.slug,
            name: program.name,
            countrySlug: program.countrySlug,
            intent: program.intent,
          }}
        />
      </div>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-12 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0 space-y-14">
          {/* 6. Eligibility */}
          <section aria-labelledby="eligibility">
            <h2
              id="eligibility"
              className="mb-4 scroll-mt-8 text-2xl font-semibold"
            >
              {SECTIONS[0].label}
            </h2>
            <DataTable
              columns={[
                { key: "requirement", label: "Requirement" },
                { key: "detail", label: "Detail" },
              ]}
              rows={program.eligibility.map((item) => ({
                requirement: item.requirement,
                detail: <FieldValue value={item.detail} />,
              }))}
            />
          </section>

          {/* 7. Documents */}
          <section aria-labelledby="documents">
            <h2
              id="documents"
              className="mb-4 scroll-mt-8 text-2xl font-semibold"
            >
              {SECTIONS[1].label}
            </h2>
            <DataTable
              columns={[
                { key: "name", label: "Document" },
                { key: "required", label: "Required" },
                { key: "note", label: "Note" },
              ]}
              rows={program.documents.map((document) => ({
                name: document.name,
                required: (
                  <Badge tone={document.required ? "success" : "neutral"}>
                    {document.required ? "Required" : "Optional"}
                  </Badge>
                ),
                note: document.note ? (
                  <FieldValue value={document.note} />
                ) : null,
              }))}
            />
          </section>

          {/* 8. Process */}
          <section aria-labelledby="process">
            <h2
              id="process"
              className="mb-4 scroll-mt-8 text-2xl font-semibold"
            >
              {SECTIONS[2].label}
            </h2>
            <ol className="space-y-6">
              {program.processSteps.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-fill font-data text-sm tabular-nums text-label"
                  >
                    {step.step}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-ui text-base font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-1 max-w-[68ch] font-read leading-relaxed text-label-2">
                      <FieldValue value={step.detail} />
                    </p>
                    <p className="mt-2 font-data text-xs tabular-nums text-label-3">
                      <FieldValue value={step.typicalDuration} />
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* 9. Bridge */}
          <ProgramBridge program={program} />

          {/* 10. Fees */}
          <section aria-labelledby="fees">
            <h2 id="fees" className="mb-4 scroll-mt-8 text-2xl font-semibold">
              {SECTIONS[3].label}
            </h2>
            <DataTable
              columns={[
                { key: "item", label: "Item" },
                { key: "amount", label: "Amount", align: "right", mono: true },
                { key: "payableBy", label: "Payable by" },
                { key: "note", label: "Note" },
              ]}
              rows={program.fees.map((fee) => ({
                item: fee.item,
                amount:
                  fee.amount === null ? (
                    <Unverified reason={splitUnverified(fee.note).reason} />
                  ) : (
                    `${fee.amount.toLocaleString("en-CA")} ${fee.currency}`
                  ),
                payableBy: fee.payableBy,
                note:
                  fee.amount === null ? null : fee.note ? (
                    <FieldValue value={fee.note} />
                  ) : null,
              }))}
            />
            {program.quotas ? (
              <p className="mt-4 max-w-[68ch] font-read leading-relaxed text-label-2">
                <FieldValue value={program.quotas} />
              </p>
            ) : null}
          </section>

          {/* 11. Pitfalls */}
          <section aria-labelledby="pitfalls">
            <h2
              id="pitfalls"
              className="mb-4 scroll-mt-8 text-2xl font-semibold"
            >
              {SECTIONS[4].label}
            </h2>
            {program.pitfalls.map((pitfall) => (
              <Callout key={pitfall.title} tone="warning" title={pitfall.title}>
                <FieldValue value={pitfall.detail} />
              </Callout>
            ))}
          </section>

          {/* 12. FAQs */}
          <section aria-labelledby="faqs">
            <h2 id="faqs" className="mb-4 scroll-mt-8 text-2xl font-semibold">
              {SECTIONS[5].label}
            </h2>
            <div className="divide-y divide-separator border-y border-separator">
              {program.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="cursor-pointer font-ui font-medium text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint">
                    {faq.question}
                  </summary>
                  <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
                    <FieldValue value={faq.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 13. Body */}
          <section aria-labelledby="about">
            <h2 id="about" className="mb-4 scroll-mt-8 text-2xl font-semibold">
              {SECTIONS[6].label}
            </h2>
            <Prose>
              <MDXRemote
                source={program.body}
                options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
              />
            </Prose>
          </section>

          {/* 14. Sources */}
          <section aria-labelledby="sources">
            <h2
              id="sources"
              className="mb-4 scroll-mt-8 text-2xl font-semibold"
            >
              {SECTIONS[7].label}
            </h2>
            <Callout tone="source" sources={program.sources} />
          </section>

          {/* 15. Review line */}
          <p className="border-y border-separator py-4 font-data text-sm text-label">
            Last reviewed {program.lastReviewed} — {program.author.name},{" "}
            {program.author.credentials}
          </p>

          {/* 16. Related */}
          <section aria-labelledby="related">
            <h2
              id="related"
              className="mb-4 scroll-mt-8 text-2xl font-semibold"
            >
              {SECTIONS[8].label}
            </h2>
            <ul className="space-y-3">
              {related.map((entry) => (
                <li key={entry.slug}>
                  {entry.record ? (
                    <Link
                      href={`/destinations/${entry.record.countrySlug}/${entry.record.intent}/${entry.record.slug}`}
                      className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
                    >
                      {entry.record.name}
                    </Link>
                  ) : (
                    <span className="text-label-2">{entry.slug}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* 17. Bridge */}
          <ProgramBridge program={program} />
        </div>

        {/* 5. Contents */}
        <div className="order-first md:order-none">
          <Toc headings={contents} />
        </div>
      </div>
    </main>
  );
}
