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

export const defaultSpacerOuterBackgroundColor = "#ffffff";

export type SpacerInstanceSettings = {
  stripe?: SpacerStripeStyle;
  gradient?: SpacerGradientStyle;
  layoutWidth?: SiteLayoutWidth;
  /** Full-width background behind the spacer (visible in contained mode). */
  outerBackgroundColor?: string;
};

export const defaultSpacerLayoutWidth: SiteLayoutWidth = "full";

export const spacerInstancesStorageKey = "lifespring-spacer-instances";

function readJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function readAllSpacerInstances(): Record<string, SpacerInstanceSettings> {
  if (typeof window === "undefined") return {};
  return readJson<Record<string, SpacerInstanceSettings>>(
    localStorage.getItem(spacerInstancesStorageKey),
  ) ?? {};
}

function writeAllSpacerInstances(instances: Record<string, SpacerInstanceSettings>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(spacerInstancesStorageKey, JSON.stringify(instances));
}

export function loadSpacerInstanceSettings(instanceId: string): SpacerInstanceSettings | undefined {
  return readAllSpacerInstances()[instanceId];
}

export function saveSpacerInstanceSettings(
  instanceId: string,
  settings: SpacerInstanceSettings,
): void {
  const instances = readAllSpacerInstances();
  instances[instanceId] = settings;
  writeAllSpacerInstances(instances);
}

export function loadAllSpacerInstanceSettings(): Record<string, SpacerInstanceSettings> {
  return readAllSpacerInstances();
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
