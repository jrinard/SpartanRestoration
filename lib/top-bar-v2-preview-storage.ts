import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import { topBarTextSizeOptions, type TopBarLayoutWidth } from "@/lib/top-bar-preview";
import {
  defaultTopBarV2PreviewSettings,
  type TopBarV2PreviewSettings,
} from "@/lib/top-bar-v2-preview";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const topBarV2PreviewStorageKey = "lifespring-top-bar-v2-preview";

function isTopBarLayoutWidth(value: unknown): value is TopBarLayoutWidth {
  return value === "contained" || value === "full";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeTopBarV2PreviewSettings(
  value: Partial<TopBarV2PreviewSettings>,
): TopBarV2PreviewSettings {
  return {
    ...defaultTopBarV2PreviewSettings,
    ...value,
    layoutWidth: isTopBarLayoutWidth(value.layoutWidth)
      ? value.layoutWidth
      : defaultTopBarV2PreviewSettings.layoutWidth,
    heightPx:
      typeof value.heightPx === "number"
        ? Math.min(120, Math.max(32, Math.round(value.heightPx)))
        : defaultTopBarV2PreviewSettings.heightPx,
    backgroundColor: isHexColor(value.backgroundColor)
      ? value.backgroundColor
      : defaultTopBarV2PreviewSettings.backgroundColor,
    outerBackgroundColor: isHexColor(value.outerBackgroundColor)
      ? value.outerBackgroundColor
      : defaultTopBarV2PreviewSettings.outerBackgroundColor,
    text1: typeof value.text1 === "string" ? value.text1 : defaultTopBarV2PreviewSettings.text1,
    text2: typeof value.text2 === "string" ? value.text2 : defaultTopBarV2PreviewSettings.text2,
    callText:
      typeof value.callText === "string" ? value.callText : defaultTopBarV2PreviewSettings.callText,
    text1Color: isHexColor(value.text1Color)
      ? value.text1Color
      : defaultTopBarV2PreviewSettings.text1Color,
    text2Color: isHexColor(value.text2Color)
      ? value.text2Color
      : defaultTopBarV2PreviewSettings.text2Color,
    callColor: isHexColor(value.callColor)
      ? value.callColor
      : defaultTopBarV2PreviewSettings.callColor,
    phoneHref:
      typeof value.phoneHref === "string"
        ? value.phoneHref
        : defaultTopBarV2PreviewSettings.phoneHref,
    textSizePx:
      typeof value.textSizePx === "number" &&
      topBarTextSizeOptions.includes(
        Math.round(value.textSizePx) as (typeof topBarTextSizeOptions)[number],
      )
        ? Math.round(value.textSizePx)
        : defaultTopBarV2PreviewSettings.textSizePx,
  };
}

function parseStoredTopBarV2Preview(raw: string): TopBarV2PreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeTopBarV2PreviewSettings(parsed as Partial<TopBarV2PreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadTopBarV2PreviewSettings(): TopBarV2PreviewSettings {
  const committed = getCommittedHomepagePreviewSettings()?.topBarV2;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultTopBarV2PreviewSettings;
  }

  const stored = orgStorageGet(topBarV2PreviewStorageKey);
  if (!stored) return defaultTopBarV2PreviewSettings;

  return parseStoredTopBarV2Preview(stored) ?? defaultTopBarV2PreviewSettings;
}

export function saveTopBarV2PreviewSettings(settings: TopBarV2PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(topBarV2PreviewStorageKey, JSON.stringify(settings));
}
