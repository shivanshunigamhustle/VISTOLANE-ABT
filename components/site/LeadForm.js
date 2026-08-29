"use client";

import { useState } from "react";

import Button from "@/components/primitives/Button";
import ErrorSummary from "@/components/primitives/ErrorSummary";
import Field from "@/components/primitives/Field";

/**
 * Lead capture, placed directly under the introduction rather than in a sidebar
 * or at the foot of the page — someone who has decided in the first screen
 * should not have to scroll past the whole reference to act on it.
 *
 * Validation is client-side for immediacy and re-run server-side in the route
 * handler, which is the boundary that actually matters.
 *
 * @param {{
 *   program: { slug: string, name: string, countrySlug: string, intent: string },
 * }} props
 * @returns {JSX.Element}
 */
export default function LeadForm({ program }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    countryOfResidence: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("idle");

  const set = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const errorFor = (fieldId) =>
    errors.find((error) => error.fieldId === fieldId)?.message;

  const validate = () => {
    const found = [];
    if (!values.name.trim()) {
      found.push({ fieldId: "lead-name", message: "Enter your full name" });
    }
    if (!values.email.trim()) {
      found.push({
        fieldId: "lead-email",
        message: "Enter your email address",
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      found.push({
        fieldId: "lead-email",
        message: "Enter an email address in the format name@example.com",
      });
    }
    if (!values.countryOfResidence.trim()) {
      found.push({
        fieldId: "lead-country",
        message: "Enter your country of residence",
      });
    }
    if (!values.phone.trim()) {
      found.push({ fieldId: "lead-phone", message: "Enter a phone number" });
    }
    return found;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setAttempt((count) => count + 1);
    if (found.length > 0) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          programSlug: program.slug,
          countrySlug: program.countrySlug,
          intent: program.intent,
        }),
      });
      setStatus(response.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="surface-raised p-6 text-sm text-label">
        Thank you. Your enquiry about {program.name} has been received and
        someone will be in touch.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="lead-form-heading"
      className="surface-raised p-6"
    >
      <h2 id="lead-form-heading" className="t-subsection">
        Enquire about {program.name}
      </h2>

      <div className="mt-4 space-y-4">
        <ErrorSummary key={attempt} errors={errors} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="lead-name"
            label="Full name"
            autoComplete="name"
            value={values.name}
            onChange={set("name")}
            error={errorFor("lead-name")}
          />
          <Field
            id="lead-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set("email")}
            error={errorFor("lead-email")}
          />
          <Field
            id="lead-country"
            label="Country of residence"
            autoComplete="country-name"
            value={values.countryOfResidence}
            onChange={set("countryOfResidence")}
            error={errorFor("lead-country")}
          />
          <Field
            id="lead-phone"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set("phone")}
            error={errorFor("lead-phone")}
          />
        </div>

        <Field
          id="lead-message"
          label="Message"
          as="textarea"
          hint="Optional."
          value={values.message}
          onChange={set("message")}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={status === "sending"}
          >
            Send enquiry
          </Button>
          {status === "failed" ? (
            <p role="alert" className="text-sm text-label">
              That did not send. Please try again.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
