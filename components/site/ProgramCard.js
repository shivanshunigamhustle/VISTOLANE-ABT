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
      className="surface-raised group flex flex-col p-6 no-underline
        transition-shadow duration-200 motion-reduce:transition-none
        hover:shadow-[0_2px_4px_rgb(0_0_0/0.06),0_8px_24px_rgb(0_0_0/0.08)]
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={program.intent}>{intentLabel}</Badge>
      </div>
      <h3 className="t-subsection mt-3 text-label group-hover:underline">
        {program.name}
      </h3>
      <p className="mt-1 font-read text-sm text-label-2">
        {program.officialName}
      </p>
      <p className="t-body mt-3 text-label">
        <FieldValue value={program.whoItsFor} />
      </p>
    </Link>
  );
}
