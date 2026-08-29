"use client";

import { useEffect, useRef } from "react";

/**
 * The summary shown at the top of a form after a failed submit.
 *
 * It complements the inline errors on each field and never replaces them: a
 * person who tabs straight to a field still needs the message at the field.
 * This gives everyone else one place to see everything that went wrong, with a
 * link to each offending control.
 *
 * Focus moves here when it appears — which is on submit, not on blur. Nothing
 * steals focus while someone is still filling the form in.
 *
 * @typedef {Object} FieldError
 * @property {string} fieldId  id of the invalid control, used as the link target.
 * @property {string} message
 */

/**
 * @param {{ errors: FieldError[], title?: string }} props
 * @returns {JSX.Element | null}
 */
export default function ErrorSummary({
  errors,
  title = "There is a problem with this form",
}) {
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));

  useEffect(() => {
    if (errors && errors.length > 0) {
      ref.current?.focus();
    }
  }, [errors]);

  if (!errors || errors.length === 0) return null;

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-xl border-l-2 p-4 text-label focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
      style={{
        borderLeftColor: "var(--color-danger)",
        backgroundColor:
          "color-mix(in srgb, var(--color-danger) 8%, transparent)",
      }}
    >
      <h2 className="flex items-center gap-2 font-ui text-sm font-semibold">
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
          className="shrink-0"
          style={{ color: "var(--color-danger)" }}
        >
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 4.75v4" />
          <path d="M8 10.9v.4" />
        </svg>
        {title}
      </h2>

      <ul className="mt-2 space-y-1.5 text-sm">
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a
              href={`#${error.fieldId}`}
              className="text-tint underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
