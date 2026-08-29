import { z } from "zod";

/**
 * Lead capture endpoint.
 *
 * TODO(OPN-06): the real CRM destination is not yet decided. This handler is the
 * single place it will be wired — when the destination is chosen, the forward
 * happens here and nothing else on the site needs to change. Until then the
 * payload is validated and logged so the shape is settled and the form is
 * testable end to end.
 */

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  countryOfResidence: z.string().min(1),
  phone: z.string().min(1),
  message: z.string(),
  // Where the enquiry came from, so a lead can be traced back to a page.
  programSlug: z.string().min(1),
  countrySlug: z.string().min(1),
  intent: z.string().min(1),
});

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Malformed request body." },
      { status: 400 }
    );
  }

  const result = leadSchema.safeParse(payload);
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

  // TODO(OPN-06): forward to the CRM instead of logging.
  console.log("[lead]", {
    ...result.data,
    receivedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true }, { status: 200 });
}
