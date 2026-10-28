/** Contact lead submission — reCAPTCHA + Resend. @see docs/recaptcha.md @see docs/resend-setup.md */
import { verifyRecaptchaToken } from "@/lib/recaptcha-server";
import { resolveContactRecaptchaRequiredForOrg } from "@/lib/resolve-contact-recaptcha.server";
import { recaptchaAction } from "@/lib/recaptcha-config";
import { sendLeadEmail } from "@/lib/send-lead-email";
import { sendFoundationContactWebhook } from "@/lib/send-foundation-contact-webhook.server";
import {
  applyContactSmsOptInOrgPolicy,
  normalizeLeadSubmission,
  validateLeadSmsOptIn,
  type LeadFieldSubmission,
  type LeadPayload,
} from "@/lib/leads";
import { readCurrentOrgId } from "@/lib/org/read-org.server";

type LeadRequestBody = (LeadPayload | { fields: LeadFieldSubmission[] }) & {
  recaptchaToken?: string;
  leadToEmail?: string;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      { success: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const { recaptchaToken, leadToEmail, ...leadFields } = body as LeadRequestBody;
  const normalized = normalizeLeadSubmission(leadFields);

  if (!normalized) {
    return Response.json(
      { success: false, message: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  const orgId = await readCurrentOrgId();
  const submission = applyContactSmsOptInOrgPolicy(normalized, orgId);

  const smsValidationError = validateLeadSmsOptIn(submission);
  if (smsValidationError) {
    return Response.json({ success: false, message: smsValidationError }, { status: 400 });
  }

  if (await resolveContactRecaptchaRequiredForOrg()) {
    const verified = await verifyRecaptchaToken(recaptchaToken ?? "", recaptchaAction);
    if (!verified) {
      return Response.json(
        {
          success: false,
          message: "reCAPTCHA verification failed. Please try again.",
        },
        { status: 400 },
      );
    }
  }

  const emailResult = await sendLeadEmail(submission, {
    leadToEmail: typeof leadToEmail === "string" ? leadToEmail : undefined,
  });
  if (!emailResult.ok) {
    return Response.json(
      { success: false, message: emailResult.message },
      { status: 500 },
    );
  }

  const webhookResult = await sendFoundationContactWebhook(submission);
  if (!webhookResult.ok) {
    console.error("[Foundation contact webhook]", webhookResult.error);
  }

  return Response.json({
    success: true,
    message: "Thank you! We'll be in touch soon.",
  });
}
