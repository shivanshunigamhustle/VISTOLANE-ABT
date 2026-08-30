import Icon from "@/components/site/IconSet";
import { FieldValue } from "@/components/primitives/Unverified";

/**
 * One raised surface, divided into compartments by rules — not a row of
 * separate cards. Used for "at a glance" style facts: a handful of related
 * figures that belong together as one object.
 *
 * @param {{
 *   items: Array<{ icon?: string, label: string, value: unknown }>,
 * }} props
 * @returns {JSX.Element}
 */
export default function StatStrip({ items }) {
  return (
    <div className="surface-raised grid divide-y divide-rule sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((item) => (
        <div key={item.label} className="p-6">
          {item.icon ? <Icon name={item.icon} className="text-tint" /> : null}
          <p className={`t-eyebrow ${item.icon ? "mt-3" : ""}`}>{item.label}</p>
          <p className="mt-2 font-ui text-[1.0625rem] text-label [overflow-wrap:anywhere]">
            <FieldValue value={item.value} />
          </p>
        </div>
      ))}
    </div>
  );
}
