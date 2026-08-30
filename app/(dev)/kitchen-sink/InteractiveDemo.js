"use client";

import { useState } from "react";

import Button from "@/components/primitives/Button";
import { Chip, ChipGroup } from "@/components/primitives/Chip";
import ErrorSummary from "@/components/primitives/ErrorSummary";
import Field from "@/components/primitives/Field";

/**
 * The parts of the kitchen sink that need state: chip selection, and a form
 * whose failed submit raises the error summary and moves focus to it.
 *
 * The intents arrive as props — no primitive and no client component reaches
 * for content itself.
 *
 * @param {{ intents: Array<{ slug: string, label: string }> }} props
 * @returns {JSX.Element}
 */
export default function InteractiveDemo({ intents }) {
  const [selected, setSelected] = useState(["work"]);
  const [values, setValues] = useState({ name: "", country: "", detail: "" });
  const [errors, setErrors] = useState([]);
  const [submitCount, setSubmitCount] = useState(0);

  const toggle = (slug) =>
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );

  const onSubmit = (event) => {
    event.preventDefault();
    const found = [];
    if (!values.name.trim()) {
      found.push({ fieldId: "demo-name", message: "Enter your full name" });
    }
    if (!values.country) {
      found.push({
        fieldId: "demo-country",
        message: "Choose a destination country",
      });
    }
    setErrors(found);
    setSubmitCount((count) => count + 1);
  };

  const errorFor = (fieldId) =>
    errors.find((error) => error.fieldId === fieldId)?.message;

  return (
    <>
      <section aria-labelledby="chips-heading" className="space-y-4">
        <h2 id="chips-heading" className="text-xl font-semibold">
          Chip
        </h2>
        <p className="max-w-prose text-sm text-label-2">
          Toggleable, aria-pressed, and wrapping. The collection below is capped
          at four so the operable overflow control is visible, never an
          ellipsis.
        </p>
        <ChipGroup label="Filter by intent" visibleCount={4}>
          {intents.map((intent) => (
            <Chip
              key={intent.slug}
              pressed={selected.includes(intent.slug)}
              onToggle={() => toggle(intent.slug)}
            >
              {intent.label}
            </Chip>
          ))}
        </ChipGroup>
        <p className="font-data text-xs text-label-3">
          selected: {selected.length ? selected.join(", ") : "none"}
        </p>
      </section>

      <section aria-labelledby="form-heading" className="space-y-4">
        <h2 id="form-heading" className="text-xl font-semibold">
          Field and ErrorSummary
        </h2>
        <p className="max-w-prose text-sm text-label-2">
          Submit with the first two fields empty. The summary appears, takes
          focus, and links to each invalid control, while the inline messages
          stay put at the fields themselves.
        </p>

        <form onSubmit={onSubmit} noValidate className="max-w-md space-y-4">
          <ErrorSummary key={submitCount} errors={errors} />

          <Field
            id="demo-name"
            label="Full name"
            hint="As written in your passport."
            error={errorFor("demo-name")}
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
          />

          <Field
            id="demo-country"
            label="Destination country"
            as="select"
            error={errorFor("demo-country")}
            value={values.country}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
            options={[
              { value: "", label: "Choose one" },
              { value: "canada", label: "Canada" },
            ]}
          />

          <Field
            id="demo-detail"
            label="Anything else we should know"
            as="textarea"
            hint="Optional."
            value={values.detail}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                detail: event.target.value,
              }))
            }
          />

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="primary">
              Submit
            </Button>
            <Button
              type="button"
              variant="quiet"
              onClick={() => {
                setErrors([]);
                setValues({ name: "", country: "", detail: "" });
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
