import {
  defaultContactFormFields,
  type ContactFormField,
} from "@/lib/contact-form-fields";
import { buildLeadEmailBodies } from "@/lib/lead-email-format";
import {
  appendSmsOptInLeadFields,
  leadPayloadFromFields,
  type LeadFieldSubmission,
  type LeadSubmission,
} from "@/lib/leads";

const defaultSampleByName: Record<string, string> = {
  name: "Jane Smith",
  businessName: "Example Landscaping Co.",
  email: "jane@example.com",
  phone: "(360) 555-0100",
  message: "I would like a quote for a backyard patio and planting beds.",
};

function sampleValueForField(
  field: ContactFormField,
  context?: { siteName?: string },
): string {
  if (field.name === "businessName" && context?.siteName?.trim()) {
    return context.siteName.trim();
  }
  const named = defaultSampleByName[field.name];
  if (named) return named;
  const placeholder = field.placeholder.trim();
  if (placeholder && placeholder !== "(optional)") return placeholder;
  return `Sample ${field.label}`;
}

function contactFormUsesLegacyLeadPayload(fields: readonly ContactFormField[]): boolean {
  if (fields.length !== defaultContactFormFields.length) return false;

  return fields.every((field, index) => {
    const legacy = defaultContactFormFields[index];
    return (
      field.name === legacy.name &&
      field.type === legacy.type &&
      field.required === legacy.required
    );
  });
}

function buildSampleFieldSubmissions(
  fields: readonly ContactFormField[],
  context?: { siteName?: string },
): LeadFieldSubmission[] {
  return fields.map((field) => ({
    name: field.name,
    label: field.label,
    value: sampleValueForField(field, context),
  }));
}

export function buildSampleContactLeadSubmission(
  fields: readonly ContactFormField[],
  options?: { includeSmsOptIn?: boolean; siteName?: string },
): LeadSubmission {
  const baseFields = buildSampleFieldSubmissions(fields, { siteName: options?.siteName });

  if (options?.includeSmsOptIn) {
    const withSms = appendSmsOptInLeadFields(baseFields, {
      smsOptIn: true,
      smsOptInSource: "https://example.com/contact-form",
      smsOptInAt: "2026-01-15T18:00:00.000Z",
      smsOptInLabel: "Sample SMS consent label",
    });
    return { fields: withSms };
  }

  if (contactFormUsesLegacyLeadPayload(fields)) {
    const legacy = leadPayloadFromFields(baseFields);
    if (legacy) return legacy;
  }

  return { fields: baseFields };
}

export function buildContactLeadEmailPreview(options: {
  fields: readonly ContactFormField[];
  siteUrl: string;
  /** Base for logo img src (Forge uses `window.location.origin`; live email uses siteUrl). */
  logoAssetBaseUrl?: string;
  siteName?: string;
  logoSrc?: string;
  includeSmsOptIn?: boolean;
}): { html: string; subject: string; replyTo: string | undefined } {
  const submission = buildSampleContactLeadSubmission(options.fields, {
    includeSmsOptIn: options.includeSmsOptIn,
    siteName: options.siteName,
  });
  const bodies = buildLeadEmailBodies(submission, options.siteUrl, {
    logoSrc: options.logoSrc,
    logoAssetBaseUrl: options.logoAssetBaseUrl,
    siteName: options.siteName,
  });
  return {
    html: bodies.html,
    subject: bodies.subject,
    replyTo: bodies.replyTo,
  };
}
