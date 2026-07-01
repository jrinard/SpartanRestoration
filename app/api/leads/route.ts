/** Contact lead submission — reCAPTCHA + Resend. @see docs/recaptcha.md @see docs/resend-setup.md */
import {
  isRecaptchaVerificationConfigured,
  verifyRecaptchaToken,
} from "@/lib/recaptcha-server";
import { recaptchaAction } from "@/lib/recaptcha-config";
import { sendLeadEmail } from "@/lib/send-lead-email";
import type { LeadPayload } from "@/lib/leads";

type LeadRequestBody = LeadPayload & {
  recaptchaToken?: string;
};

function isLeadPayload(value: unknown): value is LeadPayload {
  if (!value || typeof value !== "object") return false;

  const payload = value as Partial<LeadPayload>;
  return (
    typeof payload.name === "string" &&
    payload.name.trim().length > 0 &&
    typeof payload.businessName === "string" &&
    payload.businessName.trim().length > 0 &&
    typeof payload.email === "string" &&
    payload.email.trim().length > 0 &&
    typeof payload.message === "string" &&
    payload.message.trim().length > 0 &&
    (payload.phone === undefined || typeof payload.phone === "string")
  );
}

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

  const { recaptchaToken, ...leadFields } = body as LeadRequestBody;

  if (!isLeadPayload(leadFields)) {
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

  const emailResult = await sendLeadEmail(leadFields);
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
