export type LeadPayload = {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  message: string;
  smsOptIn?: boolean;
  smsOptInSource?: string;
  smsOptInAt?: string;
  smsOptInLabel?: string;
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
    (payload.phone === undefined || typeof payload.phone === "string") &&
    (payload.smsOptIn === undefined || typeof payload.smsOptIn === "boolean") &&
    (payload.smsOptInSource === undefined || typeof payload.smsOptInSource === "string") &&
    (payload.smsOptInAt === undefined || typeof payload.smsOptInAt === "string") &&
    (payload.smsOptInLabel === undefined || typeof payload.smsOptInLabel === "string")
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
    ...readSmsOptInFromFields(fields),
  };
}

export function validateLeadSmsOptIn(submission: LeadSubmission): string | null {
  if (isDynamicLeadSubmission(submission)) {
    const legacy = leadPayloadFromFields(submission.fields);
    if (legacy) {
      return validateLeadPayloadSmsOptIn(legacy);
    }

    const sms = readSmsOptInFromFields(submission.fields);
    if (sms.smsOptIn && !submission.fields.some((field) => field.name === "phone" && field.value.trim())) {
      return "Please enter a phone number to receive text messages.";
    }

    return null;
  }

  return validateLeadPayloadSmsOptIn(submission);
}

function validateLeadPayloadSmsOptIn(lead: LeadPayload): string | null {
  if (lead.smsOptIn && !lead.phone?.trim()) {
    return "Please enter a phone number to receive text messages.";
  }

  return null;
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

export function appendSmsOptInLeadFields(
  fields: LeadFieldSubmission[],
  metadata: Pick<LeadPayload, "smsOptIn" | "smsOptInSource" | "smsOptInAt" | "smsOptInLabel">,
): LeadFieldSubmission[] {
  const next: LeadFieldSubmission[] = [
    ...fields,
    {
      name: "sms_opt_in",
      label: "SMS opt-in",
      value: metadata.smsOptIn ? "yes" : "no",
    },
  ];

  if (metadata.smsOptIn) {
    if (metadata.smsOptInSource) {
      next.push({
        name: "sms_opt_in_source",
        label: "SMS opt-in source",
        value: metadata.smsOptInSource,
      });
    }
    if (metadata.smsOptInAt) {
      next.push({
        name: "sms_opt_in_at",
        label: "SMS opt-in at",
        value: metadata.smsOptInAt,
      });
    }
    if (metadata.smsOptInLabel) {
      next.push({
        name: "sms_opt_in_label",
        label: "SMS consent text",
        value: metadata.smsOptInLabel,
      });
    }
  }

  return next;
}

function readSmsOptInFromFields(fields: LeadFieldSubmission[]): Pick<
  LeadPayload,
  "smsOptIn" | "smsOptInSource" | "smsOptInAt" | "smsOptInLabel"
> {
  const values = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));

  const smsOptIn = values.sms_opt_in === "yes";

  return {
    smsOptIn,
    smsOptInSource: values.sms_opt_in_source || undefined,
    smsOptInAt: values.sms_opt_in_at || undefined,
    smsOptInLabel: values.sms_opt_in_label || undefined,
  };
}

/** Normalize any lead submission shape into the legacy payload when possible. */
export function submissionToLeadPayload(submission: LeadSubmission): LeadPayload | null {
  if (isDynamicLeadSubmission(submission)) {
    return leadPayloadFromFields(submission.fields);
  }

  return submission;
}
