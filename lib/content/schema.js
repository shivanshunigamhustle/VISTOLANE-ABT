import { z } from "zod";

import { INTENT_SLUGS } from "./intents.js";

/**
 * Zod schemas for every record the content layer will hand out, plus the error
 * type used to report a bad one.
 *
 * Immigration guidance is high-stakes: a page that tells someone the wrong thing
 * about their right to remain somewhere causes real harm. So `sources`, `author`
 * and `lastReviewed` are required on every program, `sources` must hold at least
 * one entry, and both schemas are strict — an unrecognised key is an error
 * rather than something to ignore, because a typo'd key is usually a field that
 * silently went missing.
 */

/** A lowercase kebab-case identifier used in URLs and filenames. */
const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'must be a lowercase kebab-case slug, e.g. "golden-visa"'
  );

/** Prose that must actually say something. */
const text = z.string().min(1, "must not be empty");

/** Prose that is allowed to be empty, but whose key must still be present. */
const note = z.string();

/**
 * A YYYY-MM-DD date.
 *
 * YAML frontmatter turns an unquoted date into a JS Date, so a content author
 * writing `lastReviewed: 2026-08-01` would otherwise fail a string check for no
 * reason they could see. Normalise that back to the ISO day before validating,
 * and the record always carries a string either way.
 */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.iso.date()
);

/**
 * Provenance, shared by both record types so they cannot drift apart.
 *
 * A country record makes factual claims about fees, timelines and living
 * conditions exactly as a program record does, so it carries the same burden:
 * at least one citable source, a named reviewer, and a review date.
 */
const sources = z
  .array(
    z.object({
      label: text,
      url: z.url(),
      retrieved: isoDate,
    })
  )
  .min(
    1,
    "at least one source is required — guidance without a citable source may not ship"
  );

const author = z.object({
  name: text,
  credentials: text,
});

/**
 * A country record.
 *
 * @typedef {Object} CountryAtAGlance
 * @property {string} processingWindow  Typical end-to-end timeframe, as prose.
 * @property {string} typicalCostRange  Headline cost range, as prose.
 * @property {string} visaFreeNote      Visa-free access caveat. May be empty.
 *
 * @typedef {Object} CountryLiving
 * @property {string} costOfLiving
 * @property {string} healthcare
 * @property {string} schooling
 * @property {string} bringingFamily
 *
 * @typedef {Object} CommonDocument
 * @property {string} name
 * @property {string} note  Guidance on the document. May be empty.
 *
 * @typedef {Object} Country
 * @property {string} slug
 * @property {string} name
 * @property {string} iso2               ISO 3166-1 alpha-2 code, uppercase.
 * @property {string} region
 * @property {string} summary
 * @property {string} currency
 * @property {string[]} languages
 * @property {"low" | "medium" | "high"} costBand
 * @property {CountryAtAGlance} atAGlance
 * @property {CountryLiving} living
 * @property {CommonDocument[]} commonDocuments
 * @property {string[]} relatedCountries  Slugs of other country records.
 * @property {Source[]} sources        At least one. Required, never optional.
 * @property {Author} author           Required, never optional.
 * @property {string} lastReviewed     ISO date. Required, never optional.
 */
export const countrySchema = z
  .object({
    slug,
    name: text,
    iso2: z
      .string()
      .regex(
        /^[A-Z]{2}$/,
        'must be a two-letter uppercase ISO 3166-1 alpha-2 code, e.g. "PT"'
      ),
    region: text,
    summary: text,
    currency: text,
    languages: z.array(text),
    costBand: z.enum(["low", "medium", "high"]),
    atAGlance: z.object({
      processingWindow: text,
      typicalCostRange: text,
      visaFreeNote: note,
    }),
    living: z.object({
      costOfLiving: text,
      healthcare: text,
      schooling: text,
      bringingFamily: text,
    }),
    commonDocuments: z.array(
      z.object({
        name: text,
        note,
      })
    ),
    relatedCountries: z.array(slug),
    sources,
    author,
    lastReviewed: isoDate,
  })
  .strict();

/**
 * A program record. Its MDX body is attached separately by the loader.
 *
 * @typedef {Object} EligibilityItem
 * @property {string} requirement
 * @property {string} detail
 *
 * @typedef {Object} ProgramDocument
 * @property {string} name
 * @property {boolean} required
 * @property {string} note  May be empty.
 *
 * @typedef {Object} ProcessStep
 * @property {number} step             1-based position in the process.
 * @property {string} title
 * @property {string} detail
 * @property {string} typicalDuration
 *
 * @typedef {Object} Fee
 * @property {string} item
 * @property {number | null} amount  null when the figure is not yet confirmed
 *   against an official source; `note` then says what to check.
 * @property {string} currency
 * @property {string} payableBy
 * @property {string} note  "Verify before publish — <what to check>", or empty.
 *
 * @typedef {Object} Pitfall
 * @property {string} title
 * @property {string} detail
 *
 * @typedef {Object} Faq
 * @property {string} question
 * @property {string} answer
 *
 * @typedef {Object} Source
 * @property {string} label
 * @property {string} url        Absolute URL of the citation.
 * @property {string} retrieved  ISO date the source was last checked.
 *
 * @typedef {Object} Author
 * @property {string} name
 * @property {string} credentials
 *
 * @typedef {Object} Program
 * @property {string} slug
 * @property {string} countrySlug
 * @property {import("./intents.js").IntentSlug} intent
 * @property {string} name
 * @property {string} officialName
 * @property {string} whoItsFor
 * @property {EligibilityItem[]} eligibility
 * @property {ProgramDocument[]} documents
 * @property {ProcessStep[]} processSteps
 * @property {Fee[]} fees
 * @property {string} processingTime
 * @property {string} validity
 * @property {boolean} extendable
 * @property {string | null} quotas  Quota description, or null when uncapped.
 * @property {Pitfall[]} pitfalls
 * @property {Faq[]} faqs
 * @property {Source[]} sources       At least one. Required, never optional.
 * @property {Author} author          Required, never optional.
 * @property {string} lastReviewed    ISO date. Required, never optional.
 * @property {string[]} relatedPrograms  Slugs of other program records.
 * @property {string} body            MDX body, attached by the loader.
 */
export const programSchema = z
  .object({
    slug,
    countrySlug: slug,
    intent: z.enum(INTENT_SLUGS),
    name: text,
    officialName: text,
    whoItsFor: text,
    eligibility: z.array(
      z.object({
        requirement: text,
        detail: text,
      })
    ),
    documents: z.array(
      z.object({
        name: text,
        required: z.boolean(),
        note,
      })
    ),
    processSteps: z.array(
      z.object({
        step: z.number().int().positive(),
        title: text,
        detail: text,
        typicalDuration: text,
      })
    ),
    // A fee whose figure has not been confirmed against an official source is
    // recorded as null rather than guessed at, with `note` saying what to check.
    // A plausible invented number is worse than a visible gap.
    fees: z.array(
      z.object({
        item: text,
        amount: z.number().nonnegative().nullable(),
        currency: text,
        payableBy: text,
        note,
      })
    ),
    processingTime: text,
    validity: text,
    extendable: z.boolean(),
    quotas: z.string().nullable(),
    pitfalls: z.array(
      z.object({
        title: text,
        detail: text,
      })
    ),
    faqs: z.array(
      z.object({
        question: text,
        answer: text,
      })
    ),
    sources,
    author,
    lastReviewed: isoDate,
    relatedPrograms: z.array(slug),
  })
  .strict();

/**
 * @typedef {Object} ContentIssue
 * @property {Array<string | number>} path
 * @property {string} message
 */

/**
 * @param {ContentIssue} issue
 * @returns {string}
 */
function formatIssue(issue) {
  const field = issue.path.length > 0 ? issue.path.join(".") : "(root)";
  return `  • ${field}: ${issue.message}`;
}

/**
 * Thrown when a file exists but does not satisfy its schema. Carries the file
 * path and the per-field issues so callers can report both.
 */
export class ContentValidationError extends Error {
  /**
   * @param {string} file  Repo-relative path of the offending file.
   * @param {ContentIssue[]} issues
   */
  constructor(file, issues) {
    super(`Invalid content in ${file}\n${issues.map(formatIssue).join("\n")}`);
    this.name = "ContentValidationError";
    /** @type {string} */
    this.file = file;
    /** @type {ContentIssue[]} */
    this.issues = issues;
  }
}

/**
 * Validate one record, naming the file and the offending fields on failure.
 *
 * @template T
 * @param {import("zod").ZodType<T>} schema
 * @param {unknown} data
 * @param {string} file  Repo-relative path, used in the error message.
 * @returns {T}
 * @throws {ContentValidationError}
 */
export function parseOrThrow(schema, data, file) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentValidationError(file, result.error.issues);
  }
  return result.data;
}
