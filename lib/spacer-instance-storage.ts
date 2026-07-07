import {
  defaultSpacerGradientStyle,
  type SpacerGradientStyle,
  type SpacerStripeStyle,
} from "@/components/sections/Spacer";
import type { ColorThemeId } from "@/lib/color-themes";
import { getDefaultSpacerStripeStyle } from "@/lib/spacer-defaults";
import {
  spacerGradientStorageKey,
  spacerStripeStorageKey,
} from "@/lib/spacer-preview-storage";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import {
  loadAllSectionInstanceSettings,
  loadSectionInstanceField,
  saveSectionInstanceField,
} from "@/lib/section-instance-storage";

export const defaultSpacerOuterBackgroundColor = "#ffffff";

export type SpacerInstanceSettings = {
  stripe?: SpacerStripeStyle;
  gradient?: SpacerGradientStyle;
  layoutWidth?: SiteLayoutWidth;
  /** Full-width background behind the spacer (visible in contained mode). */
  outerBackgroundColor?: string;
};

export const defaultSpacerLayoutWidth: SiteLayoutWidth = "full";

/** @deprecated Use sectionInstancesStorageKey */
export const spacerInstancesStorageKey = "lifespring-spacer-instances";

function readJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function loadSpacerInstanceSettings(instanceId: string): SpacerInstanceSettings | undefined {
  return loadSectionInstanceField(instanceId, "spacer");
}

export function saveSpacerInstanceSettings(
  instanceId: string,
  settings: SpacerInstanceSettings,
): void {
  saveSectionInstanceField(instanceId, "spacer", settings);
}

export function loadAllSpacerInstanceSettings(): Record<string, SpacerInstanceSettings> {
  const all = loadAllSectionInstanceSettings();
  const spacers: Record<string, SpacerInstanceSettings> = {};

  for (const [id, settings] of Object.entries(all)) {
    if (settings.spacer) {
      spacers[id] = settings.spacer;
    }
  }

  return spacers;
}

export function copySpacerInstanceSettings(
  fromId: string,
  toId: string,
  colorThemeId: ColorThemeId,
): void {
  const from = loadSpacerInstanceSettings(fromId);
  if (from) {
    saveSpacerInstanceSettings(toId, { ...from });
    return;
  }

  saveSpacerInstanceSettings(toId, {
    stripe:
      readJson<SpacerStripeStyle>(localStorage.getItem(spacerStripeStorageKey)) ??
      getDefaultSpacerStripeStyle(colorThemeId),
    gradient:
      readJson<SpacerGradientStyle>(localStorage.getItem(spacerGradientStorageKey)) ??
      defaultSpacerGradientStyle,
  });
}

export function getDefaultSpacerInstanceSettings(
  colorThemeId: ColorThemeId,
): SpacerInstanceSettings {
  return {
    stripe: getDefaultSpacerStripeStyle(colorThemeId),
    gradient: defaultSpacerGradientStyle,
    layoutWidth: defaultSpacerLayoutWidth,
    outerBackgroundColor: defaultSpacerOuterBackgroundColor,
  };
}
