/**
 * Sends contact form leads via Resend.
 *
 * @see docs/resend-setup.md — minimal setup checklist (agents: start here).
 * @see docs/email.md — full reference.
 */
import { Resend } from "resend";
import {
  getContactLeadFrom,
  isEmailConfigured,
} from "@/lib/email-config";
import { buildLeadEmailBodies, resolveLeadEmailSiteUrl } from "@/lib/lead-email-format";
import type { LeadSubmission } from "@/lib/leads";
import { readCurrentOrgId, readOrgSite } from "@/lib/org/read-org.server";
import { resolveContactLeadEmailLogoSrcForOrg } from "@/lib/resolve-contact-lead-email-logo.server";
import { resolveContactLeadToAddresses } from "@/lib/resolve-contact-lead-to.server";

type SendLeadEmailOptions = {
  leadToEmail?: string;
};

export async function sendLeadEmail(
  submission: LeadSubmission,
  options: SendLeadEmailOptions = {},
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[LifeSpring Lead]", submission);
    }
    return { ok: true };
  }

  const [toAddresses, orgId] = await Promise.all([
    resolveContactLeadToAddresses(options.leadToEmail),
    readCurrentOrgId(),
  ]);
  if (toAddresses.length === 0) {
    return {
      ok: false,
      message: "This organization is not allowed to send contact leads (check the org lead inbox).",
    };
  }

  const [site, logoSrc] = await Promise.all([readOrgSite(orgId), resolveContactLeadEmailLogoSrcForOrg()]);
  const siteUrl = resolveLeadEmailSiteUrl(site);
  const { html, text, subject, replyTo } = buildLeadEmailBodies(submission, siteUrl, {
    logoSrc,
    siteName: site.name,
  });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: getContactLeadFrom(),
    to: toAddresses,
    replyTo,
    subject,
    html,
    text,
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[LifeSpring Lead email]", error);
    }
    return {
      ok: false,
      message: "We couldn't send your message. Please try again or call us directly.",
    };
  }

  return { ok: true };
}
