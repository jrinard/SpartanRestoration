import {
  defaultButtonBorderRadiusPx,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";
import {
  defaultContactFormFields,
  type ContactFormField,
} from "@/lib/contact-form-fields";
import { formatLeadInboxList, parseLeadInboxEmails } from "@/lib/contact-lead-inbox";
import type { CSSProperties } from "react";
import { phoneTelHref } from "@/lib/phone";
import { siteConfig } from "@/config/site";
import {
  contactSmsOptInSettingsForOrg,
  normalizeContactSmsOptInSettings,
  getEffectiveContactSmsOptIn,
  type ContactSmsOptInSettings,
} from "@/lib/contact-sms-opt-in";
import type { LeadPayload } from "@/lib/leads";
import { isRecaptchaEnabled } from "@/lib/recaptcha-config";

export type ContactBackgroundMode = "solid" | "gradient";

export type ContactContent = {
  title: string;
  subtext: string;
  phonePrefix: string;
  phoneLabel: string;
  phoneHref: string;
};

export type ContactPreviewSettings = {
  backgroundMode: ContactBackgroundMode;
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  /** Gradient angle in degrees. */
  gradientAngle: number;
  /** Corner radius in pixels. */
  borderRadius: number;
  titleColor: string;
  bodyColor: string;
  /** Phone number link. Missing keeps today’s theme accent-blue. */
  phoneColor?: string;
  /** Section background behind the card — omitted until saved in playground. */
  sectionBackgroundColor?: string;
  /** Custom form fields — omitted until saved; legacy fields used as fallback. */
  formFields?: ContactFormField[];
  contentTitle?: string;
  contentSubtext?: string;
  contentPhonePrefix?: string;
  contentPhoneLabel?: string;
  contentPhoneHref?: string;
  /** Submit button overrides — omitted until saved; legacy button styling used. */
  submitText?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  buttonRadiusPx?: number;
  /** Inbox for contact form submissions — defaults to siteConfig.email. */
  leadToEmail?: string;
  /** Logo at top of lead notification emails. */
  leadEmailLogoSrc?: string;
  /** SMS consent for Foundation CRM — omitted until an org turns it on. */
  smsOptIn?: ContactSmsOptInSettings;
  /** When false, skip reCAPTCHA on contact forms (modal + hero). Omitted = use env keys when set. */
  requireRecaptcha?: boolean;
};

/** Whether the contact form should run reCAPTCHA (client + server). */
export function isContactRecaptchaRequired(
  settings?: Pick<ContactPreviewSettings, "requireRecaptcha">,
): boolean {
  if (settings?.requireRecaptcha === false) return false;
  return isRecaptchaEnabled();
}

export const defaultContactButtonSettings = {
  submitText: "Submit",
  buttonBackground: "#4d82b8",
  buttonTextColor: "#ffffff",
  buttonRadiusPx: defaultButtonBorderRadiusPx,
} as const;

/** Picker-only fallback. Live color stays theme accent-blue until a hex is saved. */
export const contactPhoneColorPickerFallback = "#3a8bd0";

export const defaultContactPreviewSettings: ContactPreviewSettings = {
  backgroundMode: "solid",
  solidColor: "#0f0f12",
  gradientFrom: "#0f0f12",
  gradientTo: "#4d82b8",
  gradientAngle: 135,
  borderRadius: 28,
  titleColor: "#ffffff",
  bodyColor: "#a8a8b8",
};

export const contactBackgroundModes: { value: ContactBackgroundMode; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

export const contactButtonBorderRadiusOptions = [0, 4, 8, 10, 20, 28] as const;

export function getEffectiveContactFormFields(settings: ContactPreviewSettings): ContactFormField[] {
  return settings.formFields ?? defaultContactFormFields;
}

export function isValidLeadToEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getEffectiveLeadToEmail(settings?: ContactPreviewSettings): string {
  const parsed = parseLeadInboxEmails(settings?.leadToEmail);
  if (parsed.length > 0) return formatLeadInboxList(parsed);
  return siteConfig.email;
}

/** Org Settings lead inbox — contact.json first, then site.json email. */
export function resolveOrgLeadInbox(options: {
  leadToEmail?: string;
  leadToEmail2?: string;
  siteEmail?: string;
}): string {
  const fromContact = parseLeadInboxEmails(options.leadToEmail, options.leadToEmail2);
  if (fromContact.length > 0) return formatLeadInboxList(fromContact);
  const fromSite = parseLeadInboxEmails(options.siteEmail);
  if (fromSite.length > 0) return formatLeadInboxList(fromSite);
  return "";
}

/** Shown in Forge + Org Settings — server may still use env after org inbox. */
export const contactLeadInboxFallbackNote =
  "Otherwise submissions honor CONTACT_LEAD_TO in .env.local / Vercel, then fall back to LifeSpring Design.";

export const CONTACT_LEAD_TO_ENV = "CONTACT_LEAD_TO";
export const CONTACT_LEAD_FROM_ENV = "CONTACT_LEAD_FROM";

export type ContactLeadToPreview =
  | { kind: "address"; address: string }
  | { kind: "env"; variable: typeof CONTACT_LEAD_TO_ENV }
  | { kind: "unset" };

/** Matches server `resolveContactLeadTo` order (before dev-only overrides). */
export function resolveContactLeadToPreview(options: {
  orgLeadToEmail?: string;
  orgLeadToEmail2?: string;
  sectionLeadToEmail?: string;
  siteEmail?: string;
}): ContactLeadToPreview {
  const fromOrgInbox = parseLeadInboxEmails(
    options.orgLeadToEmail,
    options.orgLeadToEmail2,
  );
  if (fromOrgInbox.length > 0) {
    return { kind: "address", address: formatLeadInboxList(fromOrgInbox) };
  }

  const fromSection = parseLeadInboxEmails(options.sectionLeadToEmail);
  if (fromSection.length > 0) {
    return { kind: "address", address: formatLeadInboxList(fromSection) };
  }

  const fromSite = parseLeadInboxEmails(options.siteEmail);
  if (fromSite.length > 0) {
    return { kind: "address", address: formatLeadInboxList(fromSite) };
  }

  return { kind: "env", variable: CONTACT_LEAD_TO_ENV };
}

export function formatContactLeadToPreview(preview: ContactLeadToPreview): string {
  if (preview.kind === "address") return preview.address;
  if (preview.kind === "env") return `env (${preview.variable})`;
  return "Set Lead inbox in Org Settings";
}

/** Resend From — only available on the server via env in this app. */
export function formatContactLeadFromPreview(): string {
  return `env (${CONTACT_LEAD_FROM_ENV})`;
}

/** Explicit lead-email logo only — no site logo fallback (avoids empty/broken img tags). */
export function resolveContactLeadEmailLogoSrc(options: {
  orgLeadEmailLogoSrc?: string;
  sectionLeadEmailLogoSrc?: string;
}): string {
  const fromOrg = options.orgLeadEmailLogoSrc?.trim();
  if (fromOrg) return fromOrg;
  const fromSection = options.sectionLeadEmailLogoSrc?.trim();
  if (fromSection) return fromSection;
  return "";
}

export function hasSavedContactFormFields(settings: ContactPreviewSettings): boolean {
  return settings.formFields !== undefined;
}

export function getEffectiveContactSmsOptInSettings(
  settings?: ContactPreviewSettings,
  orgId?: string | null,
): ContactSmsOptInSettings {
  const base = getEffectiveContactSmsOptIn(settings?.smsOptIn);
  const resolvedOrgId = orgId ?? siteConfig.assets.themeFolder;
  return contactSmsOptInSettingsForOrg(base, resolvedOrgId);
}

export function buildSmsOptInLeadMetadata(
  data: FormData,
  smsSettings: ContactSmsOptInSettings,
): Partial<Pick<LeadPayload, "smsOptIn" | "smsOptInSource" | "smsOptInAt" | "smsOptInLabel">> {
  if (!smsSettings.enabled) {
    return {};
  }

  const checked = data.get("smsOptIn") === "yes";
  if (!checked) {
    return {};
  }

  return {
    smsOptIn: true,
    smsOptInSource: smsSettings.source,
    smsOptInAt: new Date().toISOString(),
    smsOptInLabel: smsSettings.label,
  };
}

export function validateContactSmsOptIn(
  data: FormData,
  smsSettings: ContactSmsOptInSettings,
): string | null {
  if (!smsSettings.enabled) return null;

  const phone = String(data.get("phone") ?? "").trim();
  if (smsSettings.requirePhone && !phone) {
    return "Please enter your phone number.";
  }

  const checked = data.get("smsOptIn") === "yes";
  if (checked && !phone) {
    return "Please enter a phone number to receive text messages.";
  }

  return null;
}

export { normalizeContactSmsOptInSettings };

export function hasCustomContactSubmitButton(settings: ContactPreviewSettings): boolean {
  return (
    settings.submitText !== undefined ||
    settings.buttonBackground !== undefined ||
    settings.buttonTextColor !== undefined ||
    settings.buttonRadiusPx !== undefined
  );
}

export function resolveContactContent(
  defaults: ContactContent,
  settings: ContactPreviewSettings,
): ContactContent {
  const phoneLabel =
    settings.contentPhoneLabel !== undefined
      ? settings.contentPhoneLabel.trim()
      : defaults.phoneLabel;

  return {
    title:
      settings.contentTitle !== undefined ? settings.contentTitle.trim() : defaults.title,
    subtext:
      settings.contentSubtext !== undefined ? settings.contentSubtext.trim() : defaults.subtext,
    phonePrefix:
      settings.contentPhonePrefix !== undefined
        ? settings.contentPhonePrefix.trim()
        : defaults.phonePrefix,
    phoneLabel,
    phoneHref:
      settings.contentPhoneLabel !== undefined
        ? settings.contentPhoneHref?.trim() || (phoneLabel ? phoneTelHref(phoneLabel) : "")
        : defaults.phoneHref,
  };
}

export function pickContactButtonSettings(
  settings: ContactPreviewSettings,
): ButtonPreviewSettings {
  return {
    navBackground: settings.buttonBackground ?? defaultContactButtonSettings.buttonBackground,
    navTextColor: settings.buttonTextColor ?? defaultContactButtonSettings.buttonTextColor,
    navTextHoverColor: settings.buttonTextColor ?? defaultContactButtonSettings.buttonTextColor,
    navHoverBackground: settings.buttonBackground ?? defaultContactButtonSettings.buttonBackground,
    navButtonSize: "medium",
    navButtonRadiusPx: settings.buttonRadiusPx ?? defaultContactButtonSettings.buttonRadiusPx,
  };
}

export function getContactCardStyle(settings: ContactPreviewSettings): CSSProperties {
  const background =
    settings.backgroundMode === "gradient"
      ? `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientFrom}, ${settings.gradientTo})`
      : settings.solidColor;

  return {
    background,
    borderRadius: `${settings.borderRadius}px`,
    "--contact-title-color": settings.titleColor,
    "--contact-body-color": settings.bodyColor,
    ...(settings.phoneColor
      ? {
          "--contact-phone-color": settings.phoneColor,
          "--contact-phone-hover-color": `color-mix(in srgb, ${settings.phoneColor} 72%, #000000)`,
        }
      : {}),
    "--contact-field-text-color": "#0f0f12",
    "--contact-field-bg-color": "#ffffff",
    "--contact-field-border-color": "#0f0f12",
    "--contact-field-placeholder-color": "#6b7280",
  } as CSSProperties;
}

export function getContactSectionStyle(settings: ContactPreviewSettings): CSSProperties {
  if (settings.sectionBackgroundColor === undefined) return {};
  return { backgroundColor: settings.sectionBackgroundColor };
}

export function getContactSubmitButtonStyle(settings: ContactPreviewSettings): CSSProperties {
  return {
    backgroundColor: settings.buttonBackground ?? defaultContactButtonSettings.buttonBackground,
    color: settings.buttonTextColor ?? defaultContactButtonSettings.buttonTextColor,
    borderRadius: `${normalizeButtonBorderRadiusPx(
      settings.buttonRadiusPx ?? defaultContactButtonSettings.buttonRadiusPx,
    )}px`,
  };
}

export type HeroV4FormButtonOverrides = {
  formSubmitText?: string;
  formButtonBackground?: string;
  formButtonTextColor?: string;
  formButtonRadiusPx?: number;
  formFields?: ContactFormField[];
};

/** Light card chrome for Hero-v4 inline form — hero submit overrides win over site contact. */
export function getHeroV4FormSettings(
  contactSettings: ContactPreviewSettings = defaultContactPreviewSettings,
  leadSource?: string,
  heroForm?: HeroV4FormButtonOverrides,
): ContactPreviewSettings {
  const smsBase = getEffectiveContactSmsOptInSettings(contactSettings);
  const heroButtonOverrides: Partial<ContactPreviewSettings> = {};

  if (heroForm?.formSubmitText?.trim()) {
    heroButtonOverrides.submitText = heroForm.formSubmitText.trim();
  }
  if (heroForm?.formButtonBackground) {
    heroButtonOverrides.buttonBackground = heroForm.formButtonBackground;
  }
  if (heroForm?.formButtonTextColor) {
    heroButtonOverrides.buttonTextColor = heroForm.formButtonTextColor;
  }
  if (typeof heroForm?.formButtonRadiusPx === "number") {
    heroButtonOverrides.buttonRadiusPx = heroForm.formButtonRadiusPx;
  }
  if (heroForm?.formFields !== undefined) {
    heroButtonOverrides.formFields = heroForm.formFields;
  }

  return {
    ...contactSettings,
    backgroundMode: "solid",
    solidColor: "#ffffff",
    gradientFrom: "#ffffff",
    gradientTo: "#f6f5fa",
    gradientAngle: 180,
    borderRadius: 20,
    titleColor: "#12121c",
    bodyColor: "#5c5c72",
    smsOptIn: normalizeContactSmsOptInSettings({
      ...smsBase,
      source: leadSource?.trim() || smsBase.source,
    }),
    ...heroButtonOverrides,
  };
}
