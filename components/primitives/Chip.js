"use client";

import Link from "next/link";

import { Children, useState } from "react";

/**
 * A toggleable filter chip.
 *
 * Pressed state is announced with aria-pressed and shown with a check mark as
 * well as a fill, so the selection is not carried by colour alone.
 *
 * @param {{
 *   pressed?: boolean,
 *   onToggle?: () => void,
 *   children: React.ReactNode,
 * } & Record<string, unknown>} props
 * @returns {JSX.Element}
 */
export function Chip({ pressed = false, onToggle, href, children, ...rest }) {
  const className = `inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm no-underline
        transition-[background-color,border-color] duration-200 motion-reduce:transition-none
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint
        ${
          pressed
            ? "border-label-3 bg-fill font-medium text-label"
            : "border-separator bg-transparent text-label-2 hover:bg-fill"
        }`;

  const mark = pressed ? (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  ) : null;

  // A chip that navigates is a link, not a button. Rendering a real anchor is
  // what lets a filtered view work with JavaScript switched off, and aria-current
  // rather than aria-pressed is the correct state for "this is the view you are
  // looking at".
  if (href) {
    return (
      <Link
        href={href}
        aria-current={pressed ? "page" : undefined}
        className={className}
        {...rest}
      >
        {mark}
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={className}
      {...rest}
    >
      {pressed ? (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

/**
 * A wrapping collection of chips.
 *
 * Chips wrap onto as many lines as they need and are never truncated. Where a
 * collection has to be shortened, the remainder sits behind an operable button
 * that says how many are hidden — never an ellipsis, which cannot be reached by
 * keyboard and does not say what it conceals.
 *
 * @param {{
 *   label: string,
 *   visibleCount?: number,
 *   children: React.ReactNode,
 * }} props
 * @returns {JSX.Element}
 */
export function ChipGroup({ label, visibleCount, children }) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const limit = visibleCount ?? items.length;
  const hiddenCount = Math.max(0, items.length - limit);
  const shown = expanded || hiddenCount === 0 ? items : items.slice(0, limit);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-2"
    >
      {shown}
      {hiddenCount > 0 ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex cursor-pointer items-center rounded-[var(--radius-pill)] border border-separator px-3 py-1.5
            text-sm text-label underline underline-offset-2
            transition-[background-color] duration-200 motion-reduce:transition-none
            hover:bg-fill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
        >
          {expanded ? "Show fewer" : `+${hiddenCount} more`}
        </button>
      ) : null}
    </div>
  );
}
