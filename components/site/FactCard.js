import Icon from "@/components/site/IconSet";
import { FieldValue } from "@/components/primitives/Unverified";

/**
 * A single labelled fact, icon-led — used for the country page's "Living
 * there" section, four of these on the inset band.
 *
 * @param {{ icon: string, label: string, value: unknown }} props
 * @returns {JSX.Element}
 */
export default function FactCard({ icon, label, value }) {
  return (
    <div className="rounded-card border border-rule bg-surface p-5">
      <Icon name={icon} className="text-tint" />
      <p className="t-eyebrow mt-4">{label}</p>
      <p className="mt-2 font-read text-label">
        <FieldValue value={value} />
      </p>
    </div>
  );
}
