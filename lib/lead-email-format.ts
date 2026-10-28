import {
  isDynamicLeadSubmission,
  leadPayloadFromFields,
  type LeadFieldSubmission,
  type LeadPayload,
  type LeadSubmission,
} from "@/lib/leads";

export function escapeLeadEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const leadEmailRuleStyle =
  "border:none;border-top:1px solid #d4d4d4;margin:0;width:100%;";

export function resolveLeadEmailSiteUrl(site: { url?: string; domain?: string }): string {
  const fromUrl = site.url?.trim();
  if (fromUrl) return fromUrl;
  const domain = site.domain?.trim();
  if (domain) return domain.startsWith("http") ? domain : `https://${domain}`;
  return "";
}

export function resolveLeadEmailAssetUrl(assetSrc: string, siteUrl: string): string {
  const src = assetSrc.trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  const base = siteUrl.trim().replace(/\/$/, "");
  if (!base) return "";
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

function buildLeadEmailLogoHtml(logoAbsoluteUrl: string, siteName?: string): string {
  const url = logoAbsoluteUrl.trim();
  if (!url) return "";

  const alt = siteName?.trim() ? escapeLeadEmailHtml(siteName.trim()) : "";
  return `<p style="margin:0 0 16px;text-align:left;line-height:0;"><img src="${escapeLeadEmailHtml(url)}" alt="${alt}" style="display:block;max-width:180px;max-height:64px;width:auto;height:auto;border:0;" /></p>`;
}

export function wrapLeadEmailHtml(
  inner: string,
  siteUrl: string,
  options?: { logoSrc?: string; logoAssetBaseUrl?: string; siteName?: string },
): string {
  const footerUrl = siteUrl.trim();
  const footer = footerUrl
    ? `<p style="margin:0;font-size:12px;line-height:1.5;color:#737373;"><a href="${escapeLeadEmailHtml(footerUrl)}" style="color:#525252;text-decoration:underline;">${escapeLeadEmailHtml(footerUrl)}</a></p>`
    : "";

  const logoSrc = options?.logoSrc?.trim() ?? "";
  let logoHtml = "";
  if (logoSrc) {
    const logoBase = options?.logoAssetBaseUrl?.trim() || siteUrl;
    const absoluteLogoUrl = resolveLeadEmailAssetUrl(logoSrc, logoBase);
    if (absoluteLogoUrl) {
      logoHtml = buildLeadEmailLogoHtml(absoluteLogoUrl, options?.siteName);
    }
  }

  return `
    <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#171717;max-width:560px;">
      ${logoHtml}
      <hr style="${leadEmailRuleStyle} margin-bottom:20px;" />
      ${inner}
      <hr style="${leadEmailRuleStyle} margin-top:20px;margin-bottom:12px;" />
      ${footer}
    </div>
  `.trim();
}

export function wrapLeadEmailText(inner: string, siteUrl: string): string {
  const rule = "────────────────────────────────";
  const footerUrl = siteUrl.trim();
  const footer = footerUrl ? `\n${rule}\n${footerUrl}` : `\n${rule}`;
  return `${rule}\n\n${inner}${footer}`;
}

function formatSmsOptInLines(lead: LeadPayload): string[] {
  if (!lead.smsOptIn) return [];

  return [
    "SMS opt-in: Yes",
    lead.smsOptInSource ? `SMS opt-in source: ${lead.smsOptInSource}` : null,
    lead.smsOptInAt ? `SMS opt-in at: ${lead.smsOptInAt}` : null,
    lead.smsOptInLabel ? `SMS consent text: ${lead.smsOptInLabel}` : null,
  ].filter((line): line is string => line !== null);
}

export function formatLeadEmailTextFromPayload(lead: LeadPayload): string {
  return [
    "New contact form submission",
    "",
    `Name: ${lead.name}`,
    `Business: ${lead.businessName}`,
    `Email: ${lead.email}`,
    lead.phone ? `Phone: ${lead.phone}` : null,
    ...formatSmsOptInLines(lead),
    "",
    "Message:",
    lead.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function formatLeadEmailHtmlFromPayload(lead: LeadPayload): string {
  const escapeHtml = escapeLeadEmailHtml;
  const phoneRow = lead.phone
    ? `<tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>${escapeHtml(lead.phone)}</td></tr>`
    : "";

  const smsRows = formatSmsOptInLines(lead)
    .map((line) => {
      const [label, ...rest] = line.split(": ");
      return `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">${escapeHtml(label)}</td><td style="white-space:pre-wrap;">${escapeHtml(rest.join(": "))}</td></tr>`;
    })
    .join("");

  return `
    <h2 style="margin:0 0 16px;font-size:18px;">New contact form submission</h2>
    <table style="border-collapse:collapse;font-size:14px;line-height:1.5;">
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${escapeHtml(lead.name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Business</td><td>${escapeHtml(lead.businessName)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>${escapeHtml(lead.email)}</td></tr>
      ${phoneRow}
      ${smsRows}
    </table>
    <p style="margin:16px 0 8px;font-size:14px;color:#666;">Message</p>
    <p style="margin:0;font-size:14px;white-space:pre-wrap;">${escapeHtml(lead.message)}</p>
  `.trim();
}

export function formatLeadEmailTextFromFields(fields: LeadFieldSubmission[]): string {
  return [
    "New contact form submission",
    "",
    ...fields.map((field) => `${field.label}: ${field.value}`),
  ].join("\n");
}

export function formatLeadEmailHtmlFromFields(fields: LeadFieldSubmission[]): string {
  const escapeHtml = escapeLeadEmailHtml;
  const rows = fields
    .map(
      (field) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">${escapeHtml(field.label)}</td><td style="white-space:pre-wrap;">${escapeHtml(field.value)}</td></tr>`,
    )
    .join("");

  return `
    <h2 style="margin:0 0 16px;font-size:18px;">New contact form submission</h2>
    <table style="border-collapse:collapse;font-size:14px;line-height:1.5;">
      ${rows}
    </table>
  `.trim();
}

export function getLeadEmailSubject(submission: LeadSubmission): string {
  if (isDynamicLeadSubmission(submission)) {
    const legacy = leadPayloadFromFields(submission.fields);
    if (legacy) {
      return `New contact: ${legacy.name} — ${legacy.businessName}`;
    }

    const first = submission.fields.find((field) => field.value.trim())?.value.trim();
    return first ? `New contact: ${first}` : "New contact form submission";
  }

  return `New contact: ${submission.name} — ${submission.businessName}`;
}

export function getLeadEmailReplyTo(submission: LeadSubmission): string | undefined {
  if (isDynamicLeadSubmission(submission)) {
    const legacy = leadPayloadFromFields(submission.fields);
    if (legacy?.email) return legacy.email;

    const emailField = submission.fields.find((field) => field.name === "email" && field.value.trim());
    return emailField?.value.trim();
  }

  return submission.email;
}

export function buildLeadEmailBodies(
  submission: LeadSubmission,
  siteUrl: string,
  options?: { logoSrc?: string; logoAssetBaseUrl?: string; siteName?: string },
): { html: string; text: string; subject: string; replyTo: string | undefined } {
  const innerHtml = isDynamicLeadSubmission(submission)
    ? formatLeadEmailHtmlFromFields(submission.fields)
    : formatLeadEmailHtmlFromPayload(submission);
  const innerText = isDynamicLeadSubmission(submission)
    ? formatLeadEmailTextFromFields(submission.fields)
    : formatLeadEmailTextFromPayload(submission);

  return {
    html: wrapLeadEmailHtml(innerHtml, siteUrl, options),
    text: wrapLeadEmailText(innerText, siteUrl),
    subject: getLeadEmailSubject(submission),
    replyTo: getLeadEmailReplyTo(submission),
  };
}
