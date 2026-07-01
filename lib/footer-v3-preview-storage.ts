import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";
import {
  defaultFooterV3PreviewSettings,
  type FooterV3LayoutWidth,
  type FooterV3LogoVariant,
  type FooterV3PreviewSettings,
  type FooterV3Theme,
} from "@/lib/footer-v3-preview";

export const footerV3PreviewStorageKey = "lifespring-footer-v3-preview";

function isFooterV3LayoutWidth(value: unknown): value is FooterV3LayoutWidth {
  return value === "contained" || value === "full";
}

function isFooterV3LogoVariant(value: unknown): value is FooterV3LogoVariant {
  return value === "white" || value === "black" || value === "color";
}

function isFooterV3Theme(value: unknown): value is FooterV3Theme {
  return value === "dark" || value === "light";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isFooterV3PreviewSettings(value: unknown): value is Partial<FooterV3PreviewSettings> {
  if (!value || typeof value !== "object") return false;

  const settings = value as Partial<FooterV3PreviewSettings> & { taglineColor?: string };

  if (settings.theme !== undefined && !isFooterV3Theme(settings.theme)) return false;
  if (settings.layoutWidth !== undefined && !isFooterV3LayoutWidth(settings.layoutWidth)) {
    return false;
  }
  if (settings.logoVariant !== undefined && !isFooterV3LogoVariant(settings.logoVariant)) {
    return false;
  }

  const colorFields = [
    "subtextColor",
    "extraTextColor",
    "taglineColor",
    "linkColor",
    "linkHoverColor",
    "accentColor",
    "copyrightColor",
    "domainColor",
    "socialColor",
    "socialHoverColor",
  ] as const;

  for (const field of colorFields) {
    const color = settings[field];
    if (color !== undefined && !isHexColor(color)) return false;
  }

  return true;
}

export function normalizeFooterV3PreviewSettings(
  value: Partial<FooterV3PreviewSettings>,
): FooterV3PreviewSettings {
  const legacy = value as Partial<FooterV3PreviewSettings> & { taglineColor?: string };

  return {
    subtextColor: isHexColor(value.subtextColor)
      ? value.subtextColor
      : isHexColor(legacy.taglineColor)
        ? legacy.taglineColor
        : isHexColor(value.accentColor)
          ? value.accentColor
          : defaultFooterV3PreviewSettings.subtextColor,
    extraTextColor: isHexColor(value.extraTextColor)
      ? value.extraTextColor
      : defaultFooterV3PreviewSettings.extraTextColor,
    linkColor: isHexColor(value.linkColor)
      ? value.linkColor
      : defaultFooterV3PreviewSettings.linkColor,
    linkHoverColor: isHexColor(value.linkHoverColor)
      ? value.linkHoverColor
      : defaultFooterV3PreviewSettings.linkHoverColor,
    accentColor: isHexColor(value.accentColor)
      ? value.accentColor
      : defaultFooterV3PreviewSettings.accentColor,
    copyrightColor: isHexColor(value.copyrightColor)
      ? value.copyrightColor
      : defaultFooterV3PreviewSettings.copyrightColor,
    domainColor: isHexColor(value.domainColor)
      ? value.domainColor
      : defaultFooterV3PreviewSettings.domainColor,
    socialColor: isHexColor(value.socialColor)
      ? value.socialColor
      : defaultFooterV3PreviewSettings.socialColor,
    socialHoverColor: isHexColor(value.socialHoverColor)
      ? value.socialHoverColor
      : defaultFooterV3PreviewSettings.socialHoverColor,
    layoutWidth: isFooterV3LayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultFooterV3PreviewSettings.layoutWidth,
    logoVariant: isFooterV3LogoVariant(value.logoVariant)
      ? value.logoVariant
      : defaultFooterV3PreviewSettings.logoVariant,
    theme: isFooterV3Theme(value.theme) ? value.theme : defaultFooterV3PreviewSettings.theme,
  };
}

export function loadFooterV3PreviewSettings(): FooterV3PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.footerV3;
    if (committed) return normalizeFooterV3PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultFooterV3PreviewSettings;
  }

  try {
    const stored = localStorage.getItem(footerV3PreviewStorageKey);
    if (!stored) return defaultFooterV3PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isFooterV3PreviewSettings(parsed)) {
      return normalizeFooterV3PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultFooterV3PreviewSettings;
}

export function saveFooterV3PreviewSettings(settings: FooterV3PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(footerV3PreviewStorageKey, JSON.stringify(settings));
}
