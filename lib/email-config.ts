import { siteConfig } from "@/config/site";

/**
 * Resend email config — env vars for contact form delivery.
 *
 * @see docs/resend-setup.md — minimal setup checklist (agents: start here).
 * @see docs/email.md — full reference.
 */

/** Resend API key — same agency account can serve all clones (verify each sending domain in Resend). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Who receives contact form submissions. Defaults to siteConfig.email per clone. */
export function getContactLeadTo(): string {
  return process.env.CONTACT_LEAD_TO?.trim() || siteConfig.email;
}

/** From address — use onboarding@resend.dev until a domain is verified in Resend. */
export function getContactLeadFrom(): string {
  return process.env.CONTACT_LEAD_FROM?.trim() || "onboarding@resend.dev";
}
