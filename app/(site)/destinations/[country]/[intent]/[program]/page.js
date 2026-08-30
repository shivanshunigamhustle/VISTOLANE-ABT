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
import LatestUpdates from "@/components/site/LatestUpdates";
import LeadForm from "@/components/site/LeadForm";
import PageMasthead from "@/components/site/PageMasthead";
import ProgramBridge from "@/components/site/ProgramBridge";
import ProvenancePanel from "@/components/site/ProvenancePanel";
import ReadingProgress from "@/components/site/ReadingProgress";
import ReviewerCredit from "@/components/site/ReviewerCredit";
import SectionMarker from "@/components/site/SectionMarker";
import StepList from "@/components/site/StepList";
import {
  getAllPrograms,
  getCountry,
  getIntent,
  getNewsUpdatesFor,
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
 * landing page to be scrolled — the craft here comes from data display and
 * typography (numbered sections, an intent-hue reading rail, tabular figures),
 * never from imagery or added whitespace.
 */

/** Section anchors, also used to build the contents list — numbered, because
 *  on this page the sections really are a sequence. */
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
    title: `${program.name} | ${countryName} ${intentLabel} | Vistolane`,
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

  const [countryRecord, intentRecord, siblings, newsUpdates] =
    await Promise.all([
      getCountry(program.countrySlug),
      getIntent(program.intent),
      getPrograms({ country: program.countrySlug }),
      getNewsUpdatesFor({ program: program.slug }),
    ]);

  const countryName = countryRecord?.name ?? program.countrySlug;
  const intentLabel = intentRecord?.label ?? program.intent;
  const hue = intentRecord ? `var(${intentRecord.token})` : "var(--color-tint)";

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

  const confirmedFees = program.fees.filter((fee) => fee.amount !== null);
  const unconfirmedFees = program.fees.filter((fee) => fee.amount === null);
  const feeTotalsByCurrency = new Map();
  for (const fee of confirmedFees) {
    feeTotalsByCurrency.set(
      fee.currency,
      (feeTotalsByCurrency.get(fee.currency) ?? 0) + fee.amount
    );
  }

  return (
    <main id="main-content">
      <ReadingProgress hue={hue} />
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

      <PageMasthead
        eyebrow={program.officialName}
        title={program.name}
        standfirst={<FieldValue value={program.whoItsFor} />}
        accentHue={hue}
        breadcrumb={[
          { label: "Destinations", href: "/destinations" },
          {
            label: countryName,
            href: `/destinations/${program.countrySlug}`,
          },
          {
            label: intentLabel,
            href: `/destinations/${program.countrySlug}/${program.intent}`,
          },
          { label: program.name },
        ]}
        stats={[
          {
            label: "Processing time",
            value: <FieldValue value={program.processingTime} />,
          },
          { label: "Validity", value: <FieldValue value={program.validity} /> },
          { label: "Extendable", value: program.extendable ? "Yes" : "No" },
          { label: "Last reviewed", value: program.lastReviewed },
        ]}
      />

      {newsUpdates.length > 0 ? (
        <div className="mx-auto w-full max-w-6xl px-5 pt-12">
          <LatestUpdates updates={newsUpdates} />
        </div>
      ) : null}

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
        {/* Contents rail, left of the column on xl, active section marked in the intent hue. */}
        <div className="xl:order-first">
          <Toc headings={contents} hue={hue} />
        </div>

        <div className="surface-raised min-w-0 space-y-14 p-6 sm:p-10">
          {/* 1. Eligibility */}
          <section aria-labelledby="eligibility">
            <SectionMarker
              id="eligibility"
              eyebrow={SECTIONS[0].eyebrow}
              number={1}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[0].label}
            </SectionMarker>
            <DataTable
              caption={`${program.eligibility.length} eligibility requirement${program.eligibility.length === 1 ? "" : "s"} for ${program.name}.`}
              columns={[
                { key: "requirement", label: "Requirement", width: "35%" },
                { key: "detail", label: "Detail" },
              ]}
              rows={program.eligibility.map((item) => ({
                requirement: (
                  <span className="font-ui font-semibold text-label">
                    {item.requirement}
                  </span>
                ),
                detail: (
                  <span className="font-read">
                    <FieldValue value={item.detail} />
                  </span>
                ),
              }))}
            />
          </section>

          {/* 2. Documents */}
          <section aria-labelledby="documents">
            <SectionMarker
              id="documents"
              eyebrow={SECTIONS[1].eyebrow}
              number={2}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[1].label}
            </SectionMarker>
            <DataTable
              caption={`${program.documents.length} document${program.documents.length === 1 ? "" : "s"} to gather.`}
              columns={[
                { key: "name", label: "Document", width: "26%", nowrap: true },
                {
                  key: "required",
                  label: "Required",
                  width: "14%",
                  nowrap: true,
                },
                { key: "note", label: "Note" },
              ]}
              rows={program.documents.map((document) => ({
                name: (
                  <span className="font-ui font-semibold text-label">
                    {document.name}
                  </span>
                ),
                required: (
                  <Badge tone={document.required ? "success" : "neutral"}>
                    {document.required ? "Required" : "Optional"}
                  </Badge>
                ),
                note: document.note ? (
                  <span className="font-read">
                    <FieldValue value={document.note} />
                  </span>
                ) : null,
              }))}
            />
          </section>

          {/* 3. Process */}
          <section aria-labelledby="process">
            <SectionMarker
              id="process"
              eyebrow={SECTIONS[2].eyebrow}
              number={3}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[2].label}
            </SectionMarker>
            <StepList
              hue={hue}
              steps={program.processSteps.map((step) => ({
                step: step.step,
                title: step.title,
                detail: <FieldValue value={step.detail} />,
                typicalDuration: <FieldValue value={step.typicalDuration} />,
              }))}
            />
          </section>

          {/* 4. Bridge */}
          <ProgramBridge program={program} />

          {/* 5. Fees */}
          <section aria-labelledby="fees">
            <SectionMarker
              id="fees"
              eyebrow={SECTIONS[3].eyebrow}
              number={5}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[3].label}
            </SectionMarker>
            <DataTable
              caption={`${program.fees.length} fee line${program.fees.length === 1 ? "" : "s"}.`}
              columns={[
                { key: "item", label: "Item", width: "24%" },
                {
                  key: "amount",
                  label: "Amount",
                  align: "right",
                  mono: true,
                  width: "18%",
                  nowrap: true,
                },
                { key: "payableBy", label: "Payable by", width: "20%" },
                { key: "note", label: "Note" },
              ]}
              rows={program.fees.map((fee) => ({
                item: fee.item,
                amount:
                  fee.amount === null ? (
                    <Unverified reason={splitUnverified(fee.note).reason} />
                  ) : (
                    <>
                      {fee.amount.toLocaleString("en-CA")}{" "}
                      <span className="text-label-2">{fee.currency}</span>
                    </>
                  ),
                payableBy: fee.payableBy,
                note:
                  fee.amount === null ? null : fee.note ? (
                    <FieldValue value={fee.note} />
                  ) : null,
              }))}
            />

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule pt-4">
              <p className="font-ui text-sm font-semibold text-label">
                Total, confirmed fees only
              </p>
              <p className="font-data text-lg tabular-nums text-label">
                {feeTotalsByCurrency.size === 0
                  ? "N/A"
                  : [...feeTotalsByCurrency.entries()]
                      .map(
                        ([currency, total]) =>
                          `${total.toLocaleString("en-CA")} ${currency}`
                      )
                      .join(" + ")}
              </p>
            </div>
            {unconfirmedFees.length > 0 ? (
              <p className="mt-2 font-ui text-sm text-label-2">
                {unconfirmedFees.length}{" "}
                {unconfirmedFees.length === 1 ? "fee is" : "fees are"} excluded
                from this total because{" "}
                {unconfirmedFees.length === 1 ? "it is" : "they are"} not yet
                confirmed against an official source:{" "}
                {unconfirmedFees.map((fee) => fee.item).join(", ")}.
              </p>
            ) : null}

            {program.quotas ? (
              <p className="mt-4 max-w-[68ch] font-read leading-relaxed text-label-2">
                <FieldValue value={program.quotas} />
              </p>
            ) : null}
          </section>

          {/* 6. Pitfalls — the upgraded warning Callout, one per pitfall. */}
          <section aria-labelledby="pitfalls">
            <SectionMarker
              id="pitfalls"
              eyebrow={SECTIONS[4].eyebrow}
              number={6}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[4].label}
            </SectionMarker>
            {program.pitfalls.map((pitfall) => (
              <Callout key={pitfall.title} tone="warning" title={pitfall.title}>
                <FieldValue value={pitfall.detail} />
              </Callout>
            ))}
          </section>

          {/* 7. FAQs */}
          <section aria-labelledby="faqs">
            <SectionMarker
              id="faqs"
              eyebrow={SECTIONS[5].eyebrow}
              number={7}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[5].label}
            </SectionMarker>
            <div className="divide-y divide-rule border-y border-rule">
              {program.faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-ui font-medium text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180"
                    >
                      <path d="M3.5 6 8 10.5 12.5 6" />
                    </svg>
                  </summary>
                  <p className="disclose-content mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
                    <FieldValue value={faq.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 8. Body */}
          <section aria-labelledby="about">
            <SectionMarker
              id="about"
              eyebrow={SECTIONS[6].eyebrow}
              number={8}
              hue={hue}
              className="mb-6"
            >
              {SECTIONS[6].label}
            </SectionMarker>
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
          {/* 9. Sources */}
          <section aria-labelledby="sources">
            <SectionMarker
              id="sources"
              eyebrow={SECTIONS[7].eyebrow}
              number={9}
              hue={hue}
              className="mb-8"
            >
              {SECTIONS[7].label}
            </SectionMarker>
            <ProvenancePanel sources={program.sources} />
          </section>

          {/* Reviewer credit */}
          <ReviewerCredit
            author={program.author}
            lastReviewed={program.lastReviewed}
          />

          {/* Related */}
          <section aria-labelledby="related">
            <SectionMarker
              id="related"
              eyebrow={SECTIONS[8].eyebrow}
              className="mb-6"
            >
              {SECTIONS[8].label}
            </SectionMarker>
            <ul className="space-y-3">
              {related.map((entry) => (
                <li key={entry.slug}>
                  {entry.record ? (
                    <Link
                      href={`/destinations/${entry.record.countrySlug}/${entry.record.intent}/${entry.record.slug}`}
                      className="link-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
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

          {/* Closing bridge */}
          <ProgramBridge program={program} />
        </div>
      </div>
    </main>
  );
}
