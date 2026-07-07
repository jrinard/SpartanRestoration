export type LeadPayload = {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  message: string;
};

export type LeadFieldSubmission = {
  name: string;
  label: string;
  value: string;
};

export type LeadSubmission =
  | LeadPayload
  | {
      fields: LeadFieldSubmission[];
    };

export type LeadResult = {
  success: boolean;
  message: string;
};

type SubmitLeadOptions = {
  recaptchaToken?: string | null;
  leadToEmail?: string;
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

function isLeadFieldSubmission(value: unknown): value is LeadFieldSubmission {
  if (!value || typeof value !== "object") return false;

  const field = value as Partial<LeadFieldSubmission>;
  return (
    typeof field.name === "string" &&
    field.name.trim().length > 0 &&
    typeof field.label === "string" &&
    typeof field.value === "string"
  );
}

export function isDynamicLeadSubmission(value: unknown): value is { fields: LeadFieldSubmission[] } {
  if (!value || typeof value !== "object") return false;

  const fields = (value as { fields?: unknown }).fields;
  if (!Array.isArray(fields) || fields.length === 0) return false;

  return fields.every(isLeadFieldSubmission);
}

export function leadPayloadFromFields(fields: LeadFieldSubmission[]): LeadPayload | null {
  const values = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));

  const name = values.name;
  const email = values.email;
  const message = values.message;

  if (!name || !email || !message) return null;

  return {
    name,
    businessName: values.businessName || name,
    email,
    phone: values.phone || undefined,
    message,
  };
}

export function normalizeLeadSubmission(value: unknown): LeadSubmission | null {
  if (isLeadPayload(value)) return value;

  if (isDynamicLeadSubmission(value)) {
    const withValues = value.fields.filter((field) => field.value.trim().length > 0);
    if (withValues.length === 0) return null;

    const legacyPayload = leadPayloadFromFields(withValues);
    if (legacyPayload) return legacyPayload;

    return { fields: withValues };
  }

  return null;
}

/**
 * Submit a lead to the API route. Server verifies reCAPTCHA when configured.
 */
export async function submitLead(
  payload: LeadSubmission,
  options: SubmitLeadOptions = {},
): Promise<LeadResult> {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      recaptchaToken: options.recaptchaToken ?? undefined,
      leadToEmail: options.leadToEmail?.trim() || undefined,
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
