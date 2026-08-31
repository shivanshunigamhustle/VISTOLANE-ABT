"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A themed replacement for a native <select>.
 *
 * The browser's own dropdown panel cannot be restyled with CSS — only the
 * closed control can — so a form that wants the popup itself on-theme has to
 * build it. This follows the WAI-ARIA "select-only" combobox pattern: focus
 * stays on the trigger button the whole time, the listbox is navigated with
 * the keyboard via aria-activedescendant, and a hidden input carries the
 * value so the field still posts under `name` exactly like a native select.
 *
 * @typedef {{ value: string, label: string }} SelectOption
 */

/**
 * @param {{
 *   id: string,
 *   name: string,
 *   options: SelectOption[],
 *   placeholder: string,
 *   defaultValue?: string,
 *   className?: string,
 * }} props
 * @returns {JSX.Element}
 */
export default function Select({
  id,
  name,
  options,
  placeholder,
  defaultValue = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const items = [{ value: "", label: placeholder }, ...options];
  const selectedIndex = items.findIndex((item) => item.value === value);
  const selectedLabel = items[selectedIndex]?.label ?? placeholder;
  const optionId = (index) => `${id}-option-${index}`;

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openAt(index) {
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(index) {
    setValue(items[index]?.value ?? "");
    setActiveIndex(index);
    setOpen(false);
  }

  function onButtonKeyDown(event) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        openAt(
          open
            ? Math.min(activeIndex + 1, items.length - 1)
            : Math.max(selectedIndex, 0)
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        openAt(
          open ? Math.max(activeIndex - 1, 0) : Math.max(selectedIndex, 0)
        );
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(items.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) choose(activeIndex);
        else openAt(Math.max(selectedIndex, 0));
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      default:
        break;
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() =>
          open ? setOpen(false) : openAt(Math.max(selectedIndex, 0))
        }
        onKeyDown={onButtonKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded-control border border-rule bg-surface py-2.5 pl-3 pr-2.5 text-left text-sm text-label
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tint"
      >
        <span className={value ? "" : "text-label-2"}>{selectedLabel}</span>
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          stroke="var(--color-label-2)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6.25 8 10.25 12 6.25" />
        </svg>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          className="surface-raised absolute z-20 mt-1.5 max-h-[22rem] w-full overflow-auto p-1"
        >
          {items.map((item, index) => {
            const isSelected = item.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={item.value || "__placeholder"}
                id={optionId(index)}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-control px-3 py-2 text-sm ${
                  isSelected ? "font-semibold text-label" : "text-label"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor:
                          "color-mix(in srgb, var(--color-tint) 12%, transparent)",
                      }
                    : undefined
                }
              >
                <span>{item.label}</span>
                {isSelected ? (
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="var(--color-tint)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                  </svg>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
