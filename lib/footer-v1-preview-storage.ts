import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";
import {
  defaultFooterV1PreviewSettings,
  snapFooterV1ContactTextSizeEm,
  snapFooterV1ContentInsetPx,
  type FooterV1PreviewSettings,
} from "@/lib/footer-v1-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";

export const footerV1PreviewStorageKey = "lifespring-footer-v1-preview";

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isPreviewGradientDirection(value: unknown): value is PreviewGradientDirection {
  return (
    value === "none" ||
    value === "to bottom" ||
    value === "to top" ||
    value === "to right" ||
    value === "to left" ||
    value === "to bottom right" ||
    value === "to bottom left" ||
    value === "to top right" ||
    value === "to top left"
  );
}

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function isFooterV1PreviewSettings(value: unknown): value is Partial<FooterV1PreviewSettings> {
  if (!value || typeof value !== "object") return false;
  return true;
}

export function normalizeFooterV1PreviewSettings(
  value: Partial<FooterV1PreviewSettings>,
): FooterV1PreviewSettings {
  return {
    brandNameColor: isHexColor(value.brandNameColor)
      ? value.brandNameColor
      : defaultFooterV1PreviewSettings.brandNameColor,
    taglineColor: isHexColor(value.taglineColor)
      ? value.taglineColor
      : defaultFooterV1PreviewSettings.taglineColor,
    navColor: isHexColor(value.navColor)
      ? value.navColor
      : defaultFooterV1PreviewSettings.navColor,
    navHoverColor: isHexColor(value.navHoverColor)
      ? value.navHoverColor
      : defaultFooterV1PreviewSettings.navHoverColor,
    contactHeadingColor: isHexColor(value.contactHeadingColor)
      ? value.contactHeadingColor
      : defaultFooterV1PreviewSettings.contactHeadingColor,
    contactTextColor: isHexColor(value.contactTextColor)
      ? value.contactTextColor
      : defaultFooterV1PreviewSettings.contactTextColor,
    contactLinkHoverColor: isHexColor(value.contactLinkHoverColor)
      ? value.contactLinkHoverColor
      : defaultFooterV1PreviewSettings.contactLinkHoverColor,
    contactButtonBgColor: isHexColor(value.contactButtonBgColor)
      ? value.contactButtonBgColor
      : defaultFooterV1PreviewSettings.contactButtonBgColor,
    contactButtonHoverBgColor: isHexColor(value.contactButtonHoverBgColor)
      ? value.contactButtonHoverBgColor
      : defaultFooterV1PreviewSettings.contactButtonHoverBgColor,
    contactButtonTextColor: isHexColor(value.contactButtonTextColor)
      ? value.contactButtonTextColor
      : defaultFooterV1PreviewSettings.contactButtonTextColor,
    mainBackgroundFrom: isHexColor(value.mainBackgroundFrom)
      ? value.mainBackgroundFrom
      : defaultFooterV1PreviewSettings.mainBackgroundFrom,
    mainBackgroundTo: isHexColor(value.mainBackgroundTo)
      ? value.mainBackgroundTo
      : defaultFooterV1PreviewSettings.mainBackgroundTo,
    mainBackgroundDirection: isPreviewGradientDirection(value.mainBackgroundDirection)
      ? value.mainBackgroundDirection
      : defaultFooterV1PreviewSettings.mainBackgroundDirection,
    bottomBarBackgroundColor: isHexColor(value.bottomBarBackgroundColor)
      ? value.bottomBarBackgroundColor
      : defaultFooterV1PreviewSettings.bottomBarBackgroundColor,
    bottomBarTextColor: isHexColor(value.bottomBarTextColor)
      ? value.bottomBarTextColor
      : defaultFooterV1PreviewSettings.bottomBarTextColor,
    contactTextSizeEm:
      typeof value.contactTextSizeEm === "number"
        ? snapFooterV1ContactTextSizeEm(value.contactTextSizeEm)
        : defaultFooterV1PreviewSettings.contactTextSizeEm,
    layoutWidth: isSiteLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultFooterV1PreviewSettings.layoutWidth,
    contentInsetPx:
      typeof value.contentInsetPx === "number"
        ? snapFooterV1ContentInsetPx(value.contentInsetPx)
        : defaultFooterV1PreviewSettings.contentInsetPx,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultFooterV1PreviewSettings.outerBackgroundColor,
  };
}

export function loadFooterV1PreviewSettings(): FooterV1PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.footerV1;
    if (committed) return normalizeFooterV1PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultFooterV1PreviewSettings;
  }

  try {
    const stored = localStorage.getItem(footerV1PreviewStorageKey);
    if (!stored) return defaultFooterV1PreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isFooterV1PreviewSettings(parsed)) {
      return normalizeFooterV1PreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultFooterV1PreviewSettings;
}

export function saveFooterV1PreviewSettings(settings: FooterV1PreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(footerV1PreviewStorageKey, JSON.stringify(settings));
}
