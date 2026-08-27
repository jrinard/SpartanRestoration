import { siteConfig } from "@/config/site";

/** SMS consent block on the contact form — off unless an org turns it on. */
export type ContactSmsOptInSettings = {
  enabled: boolean;
  /** Checkbox label shown next to the consent control. */
  label: string;
  /** Checkbox starts unchecked — user must opt in to SMS explicitly. */
  defaultChecked: boolean;
  /** Require a phone number before the form can submit. */
  requirePhone: boolean;
  /** Stored on the lead as sms_opt_in_source for Foundation CRM. */
  source: string;
};

export const defaultContactSmsOptInSource = `${siteConfig.url}/contact-form`;

export const defaultContactSmsOptInLabel =
  "I agree to receive text messages regarding my inquiry, website audit, consultation, requested services, or project updates. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent is not required to purchase services. By checking this box, I agree to the Privacy Policy and Terms & Conditions.";

export const defaultContactSmsOptInSettings: ContactSmsOptInSettings = {
  enabled: false,
  label: defaultContactSmsOptInLabel,
  defaultChecked: false,
  requirePhone: true,
  source: defaultContactSmsOptInSource,
};

export function normalizeContactSmsOptInSettings(
  value: Partial<ContactSmsOptInSettings> | null | undefined,
): ContactSmsOptInSettings {
  if (!value || typeof value !== "object") {
    return { ...defaultContactSmsOptInSettings };
  }

  return {
    enabled: value.enabled === true,
    label:
      typeof value.label === "string" && value.label.trim()
        ? value.label.trim()
        : defaultContactSmsOptInSettings.label,
    defaultChecked: false,
    requirePhone: value.requirePhone !== false,
    source:
      typeof value.source === "string" && value.source.trim()
        ? value.source.trim()
        : defaultContactSmsOptInSettings.source,
  };
}

export function getEffectiveContactSmsOptIn(
  smsOptIn: Partial<ContactSmsOptInSettings> | undefined,
): ContactSmsOptInSettings {
  return normalizeContactSmsOptInSettings(smsOptIn);
}
