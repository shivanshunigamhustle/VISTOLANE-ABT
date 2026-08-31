/**
 * A static preview of what the eligibility checker looks like once a
 * visitor is inside it.
 *
 * Purely decorative — it does not read state, submit anything, or link
 * anywhere. It exists to make "Check if you qualify" concrete next to the
 * closing CTA rather than asking a reader to imagine a form. `aria-hidden`
 * because a screen reader user already has the same information as text in
 * the CTA beside it; a mock question with a mock answer would only add noise.
 *
 * `tone="ink"` sits on a brand-ink ground (a dark closing band); "plain" — the
 * default — is a raised card for a light ground, matching every other card
 * on the site.
 *
 * @param {{ tone?: "ink" | "plain" }} [props]
 * @returns {JSX.Element}
 */
export default function EligibilityPreviewCard({ tone = "plain" } = {}) {
  const options = ["Work", "Study", "Join family"];
  const selected = "Work";
  const onInk = tone === "ink";

  return (
    <div
      aria-hidden="true"
      className={
        onInk
          ? "rounded-card border border-on-brand/15 bg-on-brand/[0.04] p-6"
          : "surface-raised p-6"
      }
    >
      <div className="flex items-center justify-between">
        <span className={`t-data ${onInk ? "text-on-brand/50" : "text-label-2"}`}>
          Eligibility checker
        </span>
        <span className="t-data font-semibold text-accent">Step 2 of 5</span>
      </div>

      <p
        className={`mt-5 font-ui text-[0.9375rem] font-medium ${onInk ? "text-on-brand" : "text-label"}`}
      >
        What&apos;s the main reason for your move?
      </p>

      <div className="mt-4 flex flex-col gap-2.5">
        {options.map((option) => {
          const isSelected = option === selected;
          const restColor = onInk ? "border-on-brand/20 text-on-brand/70" : "border-rule text-label-2";
          const selectedColor = onInk
            ? "border-success text-on-brand"
            : "border-success text-label";
          return (
            <div
              key={option}
              className={`flex items-center justify-between rounded-control border px-3.5 py-2.5 font-ui text-sm ${
                isSelected ? selectedColor : restColor
              }`}
            >
              {option}
              {isSelected ? (
                <svg
                  focusable="false"
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        className={`mt-5 h-1 overflow-hidden rounded-pill ${onInk ? "bg-on-brand/15" : "bg-fill"}`}
      >
        <div className="h-full w-2/5 rounded-pill bg-accent" />
      </div>
    </div>
  );
}
