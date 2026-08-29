import { z } from "zod";

/**
 * Lead capture endpoint.
 *
 * TODO(OPN-06): the real CRM destination is not yet decided. `deliver()` below
 * is the single place it will be wired — when the destination is chosen,
 * implement deliver() and nothing else on the site needs to change. Until then
 * every submission is validated, normalised and logged, so the shape is
 * settled and every form on the site is testable end to end.
 *
 * TODO(OPN-06): document-checklist leads should be tagged distinctly in the
 * CRM once it is wired — source="document-checklist" already marks them, they
 * are the highest-intent leads the site produces.
 *
 * Accepts two request shapes:
 *   - application/json          the JS-enhanced path (existing LeadForm),
 *                                answered with a JSON body.
 *   - application/x-www-form-urlencoded   a plain HTML form post, so every
 *                                new form on the site works with JavaScript
 *                                disabled. Answered with a 303 redirect back
 *                                to `returnTo` (or "/"), carrying a result
 *                                flag in the query string the page can read
 *                                server-side.
 *
 * `source` identifies which form on the site produced the lead. `step`
 * distinguishes a partial lead (a progressive form's first, low-friction
 * step) from a complete one, so the CRM can tell them apart once OPN-06 is
 * answered. Everything except source and email is optional, because not
 * every form on the site has a country, an intent or a programme to attach.
 */

const leadSchema = z.object({
  source: z.string().min(1),
  step: z.string().optional(),
  email: z.email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  countryOfResidence: z.string().optional(),
  message: z.string().optional(),
  programSlug: z.string().optional(),
  countrySlug: z.string().optional(),
  intent: z.string().optional(),
});

/**
 * Where every validated lead ends up. Currently logs. When OPN-06 is
 * answered, implement the forward here — nothing else changes.
 *
 * @param {import("zod").infer<typeof leadSchema>} lead
 * @returns {Promise<void>}
 */
async function deliver(lead) {
  console.log("[lead]", { ...lead, receivedAt: new Date().toISOString() });
}

/**
 * @param {string} contentType
 * @returns {boolean}
 */
function isFormEncoded(contentType) {
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function POST(request) {
  const contentType = request.headers.get("content-type") ?? "";
  const asForm = isFormEncoded(contentType);

  /** @type {Record<string, unknown>} */
  let raw;
  if (asForm) {
    const formData = await request.formData();
    raw = Object.fromEntries(formData.entries());
  } else {
    try {
      raw = await request.json();
    } catch {
      return Response.json(
        { ok: false, error: "Malformed request body." },
        { status: 400 }
      );
    }
  }

  // returnTo is routing only, never part of the lead record.
  const { returnTo, ...payload } = raw;
  const result = leadSchema.safeParse(payload);

  if (asForm) {
    const base =
      typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : "/";
    const url = new URL(base, request.url);

    if (!result.success) {
      url.searchParams.set("leadError", "1");
      return Response.redirect(url, 303);
    }

    await deliver(result.data);
    url.searchParams.set(
      "leadSent",
      result.data.step === "1" ? "step1" : "complete"
    );
    // A step-1 lead is enriched, not replaced, by step 2 — the page needs
    // the email back to carry it into step 2's hidden field, since nothing
    // here holds a partial lead in a session for it to reattach to.
    if (result.data.step === "1") {
      url.searchParams.set("leadEmail", result.data.email);
    }
    return Response.redirect(url, 303);
  }

  if (!result.success) {
    return Response.json(
      {
        ok: false,
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  await deliver(result.data);
  return Response.json({ ok: true }, { status: 200 });
}
