import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";

import Badge from "@/components/primitives/Badge";
import Callout from "@/components/primitives/Callout";
import DataTable from "@/components/primitives/DataTable";
import Prose from "@/components/primitives/Prose";
import Toc from "@/components/primitives/Toc";
import Unverified, {
  FieldValue,
  splitUnverified,
} from "@/components/primitives/Unverified";
import JsonLd from "@/components/site/JsonLd";
import LeadForm from "@/components/site/LeadForm";
import ProgramBridge from "@/components/site/ProgramBridge";
import SectionHeading from "@/components/site/SectionHeading";
import {
  getAllPrograms,
  getCountry,
  getIntent,
  getProgram,
  getPrograms,
} from "@/lib/content/loader";
import { tocFromMdx } from "@/lib/content/toc";
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
  { id: "eligibility", label: "Eligibility", eyebrow: "Who qualifies" },
  { id: "documents", label: "Documents", eyebrow: "What to gather" },
  { id: "process", label: "Process", eyebrow: "What happens" },
  { id: "fees", label: "Fees", eyebrow: "What it costs" },
  { id: "pitfalls", label: "Common pitfalls", eyebrow: "What goes wrong" },
  { id: "faqs", label: "Questions", eyebrow: "Asked often" },
  { id: "about", label: "About this route", eyebrow: "In depth" },
  { id: "sources", label: "Sources", eyebrow: "Provenance" },
  { id: "related", label: "Related programs", eyebrow: "Nearby" },
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
    <main id="main-content">
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

      {/* Masthead. Chrome and identification, separated from the argument. */}
      <div className="band-ink">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-sm text-on-brand/70">
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
                    className="text-on-brand/70 underline underline-offset-4 hover:text-on-brand
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-brand"
                  >
                    {crumb.label}
                  </Link>
                  <span aria-hidden="true" className="text-on-brand/40">
                    /
                  </span>
                </li>
              ))}
              <li aria-current="page" className="text-on-brand">
                {program.name}
              </li>
            </ol>
          </nav>

          <h1 className="t-page-title mt-8 max-w-[22ch] text-on-brand">
            {program.name}
          </h1>
          <p className="mt-3 font-read text-lg text-on-brand opacity-75">
            {program.officialName}
          </p>
          <p className="t-body mt-6 text-on-brand opacity-85">
            <FieldValue value={program.whoItsFor} onInk />
          </p>

          <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-on-brand/25 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Processing time", value: program.processingTime },
              { label: "Validity", value: program.validity },
            ].map((entry) => (
              <div key={entry.label}>
                <dt className="t-eyebrow text-on-brand opacity-60">
                  {entry.label}
                </dt>
                <dd className="t-value mt-2 text-on-brand [overflow-wrap:anywhere]">
                  <FieldValue value={entry.value} onInk />
                </dd>
              </div>
            ))}
            <div>
              <dt className="t-eyebrow text-on-brand opacity-60">Extendable</dt>
              <dd className="t-value mt-2 text-on-brand">
                {program.extendable ? "Yes" : "No"}
              </dd>
            </div>
            <div>
              <dt className="t-eyebrow text-on-brand opacity-60">Intent</dt>
              <dd className="mt-2">
                <Badge tone={program.intent} onInk>
                  {intentLabel}
                </Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <LeadForm
          program={{
            slug: program.slug,
            name: program.name,
            countrySlug: program.countrySlug,
            intent: program.intent,
          }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-10 px-5 pb-16 xl:grid-cols-[15rem_minmax(0,1fr)]">
        {/* Contents rail, left of the column on xl. */}
        <div className="xl:order-first">
          <Toc headings={contents} />
        </div>

        <div className="surface-raised min-w-0 space-y-14 p-6 sm:p-10">
          {/* 6. Eligibility */}
          <section aria-labelledby="eligibility">
            <SectionHeading
              id="eligibility"
              eyebrow={SECTIONS[0].eyebrow}
              className="mb-6"
            >
              {SECTIONS[0].label}
            </SectionHeading>
            <DataTable
              columns={[
                { key: "requirement", label: "Requirement", width: "28%" },
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
            <SectionHeading
              id="documents"
              eyebrow={SECTIONS[1].eyebrow}
              className="mb-6"
            >
              {SECTIONS[1].label}
            </SectionHeading>
            <DataTable
              columns={[
                { key: "name", label: "Document", width: "26%" },
                {
                  key: "required",
                  label: "Required",
                  width: "14%",
                  nowrap: true,
                },
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
            <SectionHeading
              id="process"
              eyebrow={SECTIONS[2].eyebrow}
              className="mb-6"
            >
              {SECTIONS[2].label}
            </SectionHeading>
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
                    <p className="t-value mt-2 text-[0.8125rem] text-label-2">
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
            <SectionHeading
              id="fees"
              eyebrow={SECTIONS[3].eyebrow}
              className="mb-6"
            >
              {SECTIONS[3].label}
            </SectionHeading>
            <DataTable
              columns={[
                { key: "item", label: "Item", width: "24%" },
                {
                  key: "amount",
                  label: "Amount",
                  align: "right",
                  mono: true,
                  width: "16%",
                  nowrap: true,
                },
                { key: "payableBy", label: "Payable by", width: "22%" },
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
            <SectionHeading
              id="pitfalls"
              eyebrow={SECTIONS[4].eyebrow}
              className="mb-6"
            >
              {SECTIONS[4].label}
            </SectionHeading>
            {program.pitfalls.map((pitfall) => (
              <Callout key={pitfall.title} tone="warning" title={pitfall.title}>
                <FieldValue value={pitfall.detail} />
              </Callout>
            ))}
          </section>

          {/* 12. FAQs */}
          <section aria-labelledby="faqs">
            <SectionHeading
              id="faqs"
              eyebrow={SECTIONS[5].eyebrow}
              className="mb-6"
            >
              {SECTIONS[5].label}
            </SectionHeading>
            <div className="divide-y divide-rule border-y border-rule">
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
            <SectionHeading
              id="about"
              eyebrow={SECTIONS[6].eyebrow}
              className="mb-6"
            >
              {SECTIONS[6].label}
            </SectionHeading>
            <Prose>
              <MDXRemote
                source={program.body}
                options={{ mdxOptions: { rehypePlugins: [rehypeSlug] } }}
              />
            </Prose>
          </section>
        </div>
      </div>

      {/* Provenance sits back from the argument it supports. */}
      <div className="band-inset">
        <div className="mx-auto w-full max-w-6xl space-y-14 px-5 py-16">
          {/* 14. Sources */}
          <section aria-labelledby="sources">
            <SectionHeading
              id="sources"
              eyebrow={SECTIONS[7].eyebrow}
              className="mb-6"
            >
              {SECTIONS[7].label}
            </SectionHeading>
            <Callout tone="source" sources={program.sources} />
          </section>

          {/* 15. Review line */}
          <p className="t-value border-y border-rule py-4 text-label-2">
            Last reviewed {program.lastReviewed} — {program.author.name},{" "}
            {program.author.credentials}
          </p>

          {/* 16. Related */}
          <section aria-labelledby="related">
            <SectionHeading
              id="related"
              eyebrow={SECTIONS[8].eyebrow}
              className="mb-6"
            >
              {SECTIONS[8].label}
            </SectionHeading>
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
      </div>
    </main>
  );
}
