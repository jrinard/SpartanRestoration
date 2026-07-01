export type LeadPayload = {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  message: string;
};

export type LeadResult = {
  success: boolean;
  message: string;
};

type SubmitLeadOptions = {
  recaptchaToken?: string | null;
};

/**
 * Submit a lead to the API route. Server verifies reCAPTCHA when configured.
 */
export async function submitLead(
  payload: LeadPayload,
  options: SubmitLeadOptions = {},
): Promise<LeadResult> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      recaptchaToken: options.recaptchaToken ?? undefined,
    }),
  });

  const result = (await response.json()) as LeadResult;

  if (!response.ok) {
    return {
      success: false,
      message: result.message || "Something went wrong. Please try again.",
    };
  }

  return result;
}
