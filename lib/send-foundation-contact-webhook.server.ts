import { defaultContactSmsOptInSource } from "@/lib/contact-sms-opt-in";
import {
  submissionToLeadPayload,
  type LeadPayload,
  type LeadSubmission,
} from "@/lib/leads";

/** JSON body POSTed to Foundation — snake_case per CRM webhook spec. */
export type FoundationContactWebhookPayload = {
  name?: string;
  business_name?: string;
  email?: string;
  phone: string;
  message?: string;
  sms_opt_in: true;
  sms_opt_in_source: string;
  sms_opt_in_at?: string;
  sms_opt_in_label?: string;
};

export const defaultFoundationContactWebhookUrl =
  "https://foundation.lifespringdesign.com/webhooks/lifespring/contact_form_opt_in";

function resolveWebhookToken(): string | undefined {
  return (
    process.env.FOUNDATION_CONTACT_WEBHOOK_TOKEN?.trim() ||
    process.env.LIFESPRING_CONTACT_FORM_WEBHOOK_TOKEN?.trim() ||
    process.env.FOUNDATION_CONTACT_WEBHOOK_SECRET?.trim() ||
    undefined
  );
}

function resolveWebhookUrl(): string | undefined {
  const explicit = process.env.FOUNDATION_CONTACT_WEBHOOK_URL?.trim();
  if (explicit) return explicit;

  if (resolveWebhookToken()) return defaultFoundationContactWebhookUrl;

  return undefined;
}

export function isFoundationContactWebhookConfigured(): boolean {
  return Boolean(resolveWebhookUrl() && resolveWebhookToken());
}

function buildFoundationContactWebhookPayload(
  lead: LeadPayload,
): FoundationContactWebhookPayload | null {
  const phone = lead.phone?.trim();
  if (!phone) return null;

  const smsOptInSource = lead.smsOptInSource?.trim() || defaultContactSmsOptInSource;

  const payload: FoundationContactWebhookPayload = {
    phone,
    sms_opt_in: true,
    sms_opt_in_source: smsOptInSource,
  };

  const name = lead.name.trim();
  const businessName = lead.businessName.trim();
  const email = lead.email.trim();
  const message = lead.message.trim();
  const smsOptInAt = lead.smsOptInAt?.trim();
  const smsOptInLabel = lead.smsOptInLabel?.trim();

  if (name) payload.name = name;
  if (businessName) payload.business_name = businessName;
  if (email) payload.email = email;
  if (message) payload.message = message;
  if (smsOptInAt) payload.sms_opt_in_at = smsOptInAt;
  if (smsOptInLabel) payload.sms_opt_in_label = smsOptInLabel;

  return payload;
}

function formatWebhookError(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {
    // ignore invalid JSON
  }

  return body.trim() || `Foundation webhook returned ${status}`;
}

/**
 * POST SMS opt-in + contact details to Foundation CRM.
 * Only runs when the visitor opted in and both URL + token env vars are set.
 * Failures are logged but should not block the public contact form.
 */
export async function sendFoundationContactWebhook(
  submission: LeadSubmission,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const lead = submissionToLeadPayload(submission);
  if (!lead?.smsOptIn) {
    return { ok: true };
  }

  const url = resolveWebhookUrl();
  if (!url) {
    return { ok: true };
  }

  const token = resolveWebhookToken();
  if (!token) {
    const message =
      "Foundation webhook URL is set but FOUNDATION_CONTACT_WEBHOOK_TOKEN is missing.";
    console.error(`[Foundation contact webhook] ${message}`);
    return { ok: false, error: message };
  }

  const payload = buildFoundationContactWebhookPayload(lead);
  if (!payload) {
    const message = "Foundation webhook skipped — phone is required when SMS opt-in is checked.";
    console.error(`[Foundation contact webhook] ${message}`);
    return { ok: false, error: message };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-LifeSpring-Webhook-Token": token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        ok: false,
        error: formatWebhookError(response.status, text),
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Foundation webhook request failed",
    };
  }
}
