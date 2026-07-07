import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultTopBarPreviewSettings,
  topBarTextSizeOptions,
  type TopBarLayoutWidth,
  type TopBarPreviewSettings,
} from "@/lib/top-bar-preview";

export const topBarPreviewStorageKey = "lifespring-top-bar-preview";

function isTopBarLayoutWidth(value: unknown): value is TopBarLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeTopBarPreviewSettings(
  value: Partial<TopBarPreviewSettings>,
): TopBarPreviewSettings {
  return {
    ...defaultTopBarPreviewSettings,
    ...value,
    layoutWidth: isTopBarLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultTopBarPreviewSettings.layoutWidth,
    heightPx:
      typeof value.heightPx === "number"
        ? Math.min(120, Math.max(32, Math.round(value.heightPx)))
        : defaultTopBarPreviewSettings.heightPx,
    leftWidthPercent:
      typeof value.leftWidthPercent === "number"
        ? Math.min(70, Math.max(20, Math.round(value.leftWidthPercent)))
        : defaultTopBarPreviewSettings.leftWidthPercent,
    leftBackgroundColor: isHexColor(value.leftBackgroundColor)
      ? value.leftBackgroundColor
      : defaultTopBarPreviewSettings.leftBackgroundColor,
    rightBackgroundColor: isHexColor(value.rightBackgroundColor)
      ? value.rightBackgroundColor
      : defaultTopBarPreviewSettings.rightBackgroundColor,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultTopBarPreviewSettings.outerBackgroundColor,
    leftLabelColor: isHexColor(value.leftLabelColor)
      ? value.leftLabelColor
      : defaultTopBarPreviewSettings.leftLabelColor,
    leftAccentColor: isHexColor(value.leftAccentColor)
      ? value.leftAccentColor
      : defaultTopBarPreviewSettings.leftAccentColor,
    rightTextColor: isHexColor(value.rightTextColor)
      ? value.rightTextColor
      : defaultTopBarPreviewSettings.rightTextColor,
    leftLabel:
      typeof value.leftLabel === "string" && value.leftLabel.trim()
        ? value.leftLabel
        : defaultTopBarPreviewSettings.leftLabel,
    leftAccent:
      typeof value.leftAccent === "string" && value.leftAccent.trim()
        ? value.leftAccent
        : defaultTopBarPreviewSettings.leftAccent,
    rightText:
      typeof value.rightText === "string" && value.rightText.trim()
        ? value.rightText
        : defaultTopBarPreviewSettings.rightText,
    phoneHref:
      typeof value.phoneHref === "string" && value.phoneHref.trim()
        ? value.phoneHref
        : defaultTopBarPreviewSettings.phoneHref,
    textSizePx:
      typeof value.textSizePx === "number" &&
      topBarTextSizeOptions.includes(
        Math.round(value.textSizePx) as (typeof topBarTextSizeOptions)[number],
      )
        ? Math.round(value.textSizePx)
        : defaultTopBarPreviewSettings.textSizePx,
  };
}

function parseStoredTopBarPreview(raw: string): TopBarPreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeTopBarPreviewSettings(parsed as Partial<TopBarPreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadTopBarPreviewSettings(): TopBarPreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.topBar;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultTopBarPreviewSettings;
  }

  const stored = localStorage.getItem(topBarPreviewStorageKey);
  if (!stored) return defaultTopBarPreviewSettings;

  return parseStoredTopBarPreview(stored) ?? defaultTopBarPreviewSettings;
}

export function saveTopBarPreviewSettings(settings: TopBarPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(topBarPreviewStorageKey, JSON.stringify(settings));
}
