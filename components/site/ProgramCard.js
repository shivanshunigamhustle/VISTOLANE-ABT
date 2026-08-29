import Link from "next/link";
import Badge from "@/components/primitives/Badge";
import { FieldValue } from "@/components/primitives/Unverified";

/**
 * One programme, as a card on a discovery surface.
 *
 * @param {{
 *   program: import("@/lib/content/schema").Program,
 *   intentLabel: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function ProgramCard({ program, intentLabel }) {
  return (
    <Link
      href={`/destinations/${program.countrySlug}/${program.intent}/${program.slug}`}
      className="group flex flex-col rounded-2xl border border-separator bg-surface p-6 no-underline
        transition-colors duration-200 motion-reduce:transition-none hover:bg-bg-grouped
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={program.intent}>{intentLabel}</Badge>
      </div>
      <h3 className="mt-3 font-ui text-xl font-semibold text-label group-hover:underline">
        {program.name}
      </h3>
      <p className="mt-1 font-read text-sm text-label-2">
        {program.officialName}
      </p>
      <p className="mt-3 max-w-[68ch] font-read leading-relaxed text-label-2">
        <FieldValue value={program.whoItsFor} />
      </p>
    </Link>
  );
}
