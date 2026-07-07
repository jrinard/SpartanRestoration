/** Contact lead submission — reCAPTCHA + Resend. @see docs/recaptcha.md @see docs/resend-setup.md */
import {
  isRecaptchaVerificationConfigured,
  verifyRecaptchaToken,
} from "@/lib/recaptcha-server";
import { recaptchaAction } from "@/lib/recaptcha-config";
import { sendLeadEmail } from "@/lib/send-lead-email";
import {
  isDynamicLeadSubmission,
  leadPayloadFromFields,
  normalizeLeadSubmission,
  type LeadFieldSubmission,
  type LeadPayload,
} from "@/lib/leads";

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
  const submission = normalizeLeadSubmission(leadFields);

  if (!submission) {
    return Response.json(
      { success: false, message: "Please fill in all required fields." },
      { status: 400 },
    );
  }

  if (isRecaptchaVerificationConfigured()) {
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

  return Response.json({
    success: true,
    message: "Thank you! We'll be in touch soon.",
  });
}
