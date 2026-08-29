import { confirmedText } from "@/lib/content/unverified";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/metadata";

/**
 * JSON-LD builders. Pure functions returning plain objects — nothing here knows
 * about React, and nothing here reads the filesystem.
 *
 * A note so nobody over-promises this to the client: Google restricted FAQ rich
 * results to government and health sites, so FAQPage will NOT produce rich
 * snippets for this site. It is still worth emitting because it helps a search
 * engine understand what the page is about and how its entities relate. It is
 * not a rich-result feature and should not be sold as one.
 *
 * Unverified content is stripped before it reaches structured data. A record
 * field reading "Verify before publish — confirm the current fee" is an internal
 * note, not an answer, and publishing it as one to a crawler would be worse than
 * publishing nothing. Where a field is wholly unverified its entry is omitted,
 * which keeps the structured data matching what a reader actually sees.
 */

const CONTEXT = "https://schema.org";

/**
 * @param {import("@/lib/content/schema").Author} author
 * @returns {{ "@type": "Person", name: string, jobTitle?: string }}
 */
function personFrom(author) {
  const person = { "@type": "Person", name: author.name };
  if (author.credentials) person.jobTitle = author.credentials;
  return person;
}

/**
 * Breadcrumbs. Emitted on every page.
 *
 * @param {Array<{ name: string, path: string }>} trail
 * @returns {object}
 */
export function breadcrumbList(trail) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Questions and answers from a programme record.
 *
 * @param {import("@/lib/content/schema").Program} program
 * @returns {object | null} null when no answer survives the unverified filter.
 */
export function faqPage(program) {
  const questions = program.faqs
    .map((faq) => ({
      question: faq.question,
      answer: confirmedText(faq.answer),
    }))
    .filter((faq) => faq.answer.length > 0)
    .map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    }));

  if (questions.length === 0) return null;

  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: questions,
  };
}

/**
 * The application process as a HowTo.
 *
 * No totalTime is emitted: the records hold durations as prose ("8-14 months"),
 * and schema.org wants an ISO 8601 duration. Converting prose into a precise
 * machine value would be inventing precision the research does not have.
 *
 * @param {import("@/lib/content/schema").Program} program
 * @param {string} path  Site-relative path of the programme page.
 * @returns {object | null} null when no step survives the unverified filter.
 */
export function howTo(program, path) {
  const steps = program.processSteps
    .map((step) => ({ ...step, text: confirmedText(step.detail) }))
    .filter((step) => step.text.length > 0)
    .map((step) => ({
      "@type": "HowToStep",
      position: step.step,
      name: step.title,
      text: step.text,
      url: `${absoluteUrl(path)}#process`,
    }));

  if (steps.length === 0) return null;

  const description = confirmedText(program.whoItsFor);

  return {
    "@context": CONTEXT,
    "@type": "HowTo",
    name: `How to apply for ${program.name}`,
    ...(description ? { description } : {}),
    step: steps,
    dateModified: program.lastReviewed,
    author: personFrom(program.author),
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(path) },
  };
}

/**
 * A long-form guide.
 *
 * Built now and wired when guides exist — there is no guide content type yet, so
 * this takes a plain shape rather than a record from the loader.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   path: string,
 *   lastReviewed: string,
 *   datePublished?: string,
 *   author: import("@/lib/content/schema").Author,
 * }} guide
 * @returns {object}
 */
export function article(guide) {
  const description = confirmedText(guide.description ?? "");

  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: guide.title,
    ...(description ? { description } : {}),
    ...(guide.datePublished ? { datePublished: guide.datePublished } : {}),
    dateModified: guide.lastReviewed,
    author: personFrom(guide.author),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(guide.path) },
  };
}

/**
 * The site itself. Emitted on the home page.
 *
 * No potentialAction: the destination search filters by intent and region rather
 * than by free text, so a SearchAction with a query template would describe a
 * search this site does not offer. No Organization logo either — there is no
 * logo yet (OPN-09).
 *
 * @param {{ description: string }} options
 * @returns {object}
 */
export function webSite({ description }) {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}
