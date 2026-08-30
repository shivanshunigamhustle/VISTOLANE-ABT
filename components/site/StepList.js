/**
 * Numbered process steps, connected by a vertical rule down the left —
 * used on the programme page's "Process" section. The circles carry the
 * step number in the programme's intent hue; that hue is what makes the
 * six intents do real navigational work on a reference page.
 *
 * @param {{
 *   steps: Array<{ step: number, title: string, detail: React.ReactNode, typicalDuration: React.ReactNode }>,
 *   hue: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function StepList({ steps, hue }) {
  return (
    <ol className="relative space-y-8">
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-[13px] top-4 w-px"
        style={{ backgroundColor: "var(--color-rule)" }}
      />
      {steps.map((step) => (
        <li key={step.step} className="relative flex gap-4">
          <span
            aria-hidden="true"
            className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full font-data text-sm tabular-nums text-on-brand"
            style={{ backgroundColor: hue }}
          >
            {step.step}
          </span>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-ui text-base font-semibold text-label">
              {step.title}
            </h3>
            <p className="mt-1 max-w-[68ch] font-read leading-relaxed text-label-2">
              {step.detail}
            </p>
            <p className="mt-2 font-data text-[0.8125rem] text-label-2">
              {step.typicalDuration}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
