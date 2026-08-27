import {
  defaultButtonBorderRadiusPx,
  normalizeButtonBorderRadiusPx,
  type ButtonPreviewSettings,
} from "@/lib/button-preview";
import {
  defaultContactFormFields,
  type ContactFormField,
} from "@/lib/contact-form-fields";
import type { CSSProperties } from "react";
import { phoneTelHref } from "@/lib/phone";
import { siteConfig } from "@/config/site";
import {
  normalizeContactSmsOptInSettings,
  getEffectiveContactSmsOptIn,
  type ContactSmsOptInSettings,
} from "@/lib/contact-sms-opt-in";

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
  /** SMS consent for Foundation CRM — omitted until an org turns it on. */
  smsOptIn?: ContactSmsOptInSettings;
};

export const defaultContactButtonSettings = {
  submitText: "Submit",
  buttonBackground: "#4d82b8",
  buttonTextColor: "#ffffff",
  buttonRadiusPx: defaultButtonBorderRadiusPx,
} as const;

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
  const stored = settings?.leadToEmail?.trim();
  if (stored && isValidLeadToEmail(stored)) return stored;
  return siteConfig.email;
}

/** Org Settings lead inbox — contact.json first, then site.json email. */
export function resolveOrgLeadInbox(options: {
  leadToEmail?: string;
  siteEmail?: string;
}): string {
  const fromContact = options.leadToEmail?.trim();
  if (fromContact && isValidLeadToEmail(fromContact)) return fromContact;
  const fromSite = options.siteEmail?.trim();
  if (fromSite && isValidLeadToEmail(fromSite)) return fromSite;
  return "";
}

/** Shown in Forge + Org Settings — server may still use env after org inbox. */
export const contactLeadInboxFallbackNote =
  "Otherwise submissions honor CONTACT_LEAD_TO in .env.local / Vercel, then fall back to LifeSpring Design.";

export function hasSavedContactFormFields(settings: ContactPreviewSettings): boolean {
  return settings.formFields !== undefined;
}

export function getEffectiveContactSmsOptInSettings(
  settings?: ContactPreviewSettings,
): ContactSmsOptInSettings {
  return getEffectiveContactSmsOptIn(settings?.smsOptIn);
}

export function buildSmsOptInLeadMetadata(
  data: FormData,
  smsSettings: ContactSmsOptInSettings,
): {
  smsOptIn: boolean;
  smsOptInSource?: string;
  smsOptInAt?: string;
  smsOptInLabel?: string;
} {
  if (!smsSettings.enabled) {
    return { smsOptIn: false };
  }

  const checked = data.get("smsOptIn") === "yes";
  if (!checked) {
    return { smsOptIn: false };
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

/** Light card chrome for Hero-v4 inline form — fields/submit/inbox match site contact settings. */
export function getHeroV4FormSettings(
  contactSettings: ContactPreviewSettings = defaultContactPreviewSettings,
  leadSource?: string,
): ContactPreviewSettings {
  const smsBase = getEffectiveContactSmsOptInSettings(contactSettings);

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
  };
}
