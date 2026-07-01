/**
 * Sends contact form leads via Resend.
 *
 * @see docs/resend-setup.md — minimal setup checklist (agents: start here).
 * @see docs/email.md — full reference.
 */
import { Resend } from "resend";
import {
  getContactLeadFrom,
  getContactLeadTo,
  isEmailConfigured,
} from "@/lib/email-config";
import type { LeadPayload } from "@/lib/leads";

function formatLeadEmailText(lead: LeadPayload): string {
  return [
    "New contact form submission",
    "",
    `Name: ${lead.name}`,
    `Business: ${lead.businessName}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    "",
    "Message:",
    lead.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

function formatLeadEmailHtml(lead: LeadPayload): string {
  const phoneRow = lead.phone
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>${escapeHtml(lead.phone)}</td></tr>`
    : "";

  return `
    <h2 style="margin:0 0 16px;font-size:18px;">New contact form submission</h2>
    <table style="border-collapse:collapse;font-size:14px;line-height:1.5;">
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${escapeHtml(lead.name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Business</td><td>${escapeHtml(lead.businessName)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>${escapeHtml(lead.email)}</td></tr>
      ${phoneRow}
    </table>
    <p style="margin:16px 0 8px;font-size:14px;color:#666;">Message</p>
    <p style="margin:0;font-size:14px;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
  `.trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendLeadEmail(
  lead: LeadPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV === "development") {
      console.log("[LifeSpring Lead]", lead);
    }
    return { ok: true };
  }

  const to = getContactLeadTo();
  if (!to) {
    return {
      ok: false,
      message: "Contact email is not configured on the server.",
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: getContactLeadFrom(),
    to: [to],
    replyTo: lead.email,
    subject: `New contact: ${lead.name} — ${lead.businessName}`,
    html: formatLeadEmailHtml(lead),
    text: formatLeadEmailText(lead),
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
