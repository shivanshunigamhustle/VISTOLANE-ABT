/**
 * A labelled form control with an optional hint and an inline error.
 *
 * Every control has a real <label for>. The hint and the error are both linked
 * through aria-describedby, and an invalid control is marked aria-invalid rather
 * than being left to a red border — the error message is always present as text
 * with an icon, so the failure is legible without colour vision.
 *
 * @typedef {Object} FieldOption
 * @property {string} value
 * @property {string} label
 */

/**
 * @param {{
 *   id: string,
 *   label: string,
 *   as?: "input" | "select" | "textarea",
 *   hint?: string,
 *   error?: string,
 *   options?: FieldOption[],
 *   className?: string,
 * } & Record<string, unknown>} props
 * @returns {JSX.Element}
 */
export default function Field({
  id,
  label,
  as = "input",
  hint,
  error,
  options,
  className = "",
  ...rest
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const controlClasses = `w-full rounded-[var(--radius-control)] border bg-surface px-3 py-2 text-sm text-label
    transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none
    placeholder:text-label-3
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint
    ${error ? "border-danger" : "border-rule"}`;

  const shared = {
    id,
    className: controlClasses,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    ...rest,
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      <label htmlFor={id} className="font-ui text-sm font-medium text-label">
        {label}
      </label>

      {as === "select" ? (
        <select {...shared}>
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea rows={4} {...shared} />
      ) : (
        <input {...shared} />
      )}

      {hint ? (
        <p id={hintId} className="text-xs text-label-2">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          className="flex items-start gap-1.5 text-xs font-medium text-label"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 16 16"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-px shrink-0"
            style={{ color: "var(--color-danger)" }}
          >
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.75v4" />
            <path d="M8 10.9v.4" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}
