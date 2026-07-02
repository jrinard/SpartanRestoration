import {
  defaultSpacerGradientStyle,
  type SpacerGradientStyle,
  type SpacerStripeStyle,
} from "@/components/sections/Spacer";
import type { ColorThemeId } from "@/lib/color-themes";
import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import { getDefaultSpacerStripeStyleForVariant } from "@/lib/spacer-defaults";
import {
  loadSpacerInstanceSettings,
  saveSpacerInstanceSettings,
  type SpacerInstanceSettings,
} from "@/lib/spacer-instance-storage";

export const spacerStripeStorageKey = "lifespring-spacer-stripe-style";
export const spacerGradientStorageKey = "lifespring-spacer-gradient-style";

function normalizeSpacerStripeStyle(
  style: SpacerStripeStyle,
  colorThemeId: ColorThemeId,
  variantId?: string,
): SpacerStripeStyle {
  return {
    ...getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId),
    ...style,
    overlap: style.overlap === true,
  };
}

function isSpacerStripeStyle(value: unknown): value is SpacerStripeStyle {
  if (!value || typeof value !== "object") return false;

  const style = value as SpacerStripeStyle;
  return (
    typeof style.from === "string" &&
    typeof style.to === "string" &&
    typeof style.direction === "string" &&
    typeof style.mode === "string" &&
    typeof style.heightPx === "number"
  );
}

function isSpacerGradientStyle(value: unknown): value is SpacerGradientStyle {
  if (!value || typeof value !== "object") return false;

  const style = value as SpacerGradientStyle;
  return typeof style.heightPx === "number";
}

function loadLegacyStripeFromStorage(): SpacerStripeStyle | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = localStorage.getItem(spacerStripeStorageKey);
    if (!stored) return undefined;
    const parsed: unknown = JSON.parse(stored);
    if (isSpacerStripeStyle(parsed)) return parsed;
  } catch {
    // ignore
  }

  return undefined;
}

function loadLegacyGradientFromStorage(): SpacerGradientStyle | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = localStorage.getItem(spacerGradientStorageKey);
    if (!stored) return undefined;
    const parsed: unknown = JSON.parse(stored);
    if (isSpacerGradientStyle(parsed)) return parsed;
  } catch {
    // ignore
  }

  return undefined;
}

function getCommittedSpacerSettings(instanceId?: string): SpacerInstanceSettings | undefined {
  const committed = getCommittedHomepagePreviewSettings();
  if (!committed) return undefined;

  if (instanceId && committed.spacers?.[instanceId]) {
    return committed.spacers[instanceId];
  }

  if (!instanceId && (committed.spacerStripe || committed.spacerGradient)) {
    return {
      stripe: committed.spacerStripe,
      gradient: committed.spacerGradient,
    };
  }

  return undefined;
}

export function loadSpacerStripeStyle(
  colorThemeId: ColorThemeId,
  instanceId?: string,
  variantId?: string,
): SpacerStripeStyle {
  const committed = getCommittedSpacerSettings(instanceId);
  if (committed?.stripe) {
    return normalizeSpacerStripeStyle(committed.stripe, colorThemeId, variantId);
  }

  if (instanceId) {
    const instance = loadSpacerInstanceSettings(instanceId);
    if (instance?.stripe) {
      return normalizeSpacerStripeStyle(instance.stripe, colorThemeId, variantId);
    }
  }

  if (typeof window === "undefined") {
    return getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId);
  }

  const legacy = loadLegacyStripeFromStorage();
  if (legacy) {
    return normalizeSpacerStripeStyle(legacy, colorThemeId, variantId);
  }

  return getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId);
}

export function loadSpacerGradientStyle(instanceId?: string): SpacerGradientStyle {
  const committed = getCommittedSpacerSettings(instanceId);
  if (committed?.gradient) return committed.gradient;

  if (instanceId) {
    const instance = loadSpacerInstanceSettings(instanceId);
    if (instance?.gradient) return instance.gradient;
  }

  if (typeof window === "undefined") {
    return defaultSpacerGradientStyle;
  }

  const legacy = loadLegacyGradientFromStorage();
  if (legacy) return legacy;

  return defaultSpacerGradientStyle;
}

export function saveSpacerStripeStyle(style: SpacerStripeStyle, instanceId?: string): void {
  if (typeof window === "undefined") return;

  if (instanceId) {
    const current = loadSpacerInstanceSettings(instanceId) ?? {};
    saveSpacerInstanceSettings(instanceId, { ...current, stripe: style });
    return;
  }

  localStorage.setItem(spacerStripeStorageKey, JSON.stringify(style));
}

export function saveSpacerGradientStyle(style: SpacerGradientStyle, instanceId?: string): void {
  if (typeof window === "undefined") return;

  if (instanceId) {
    const current = loadSpacerInstanceSettings(instanceId) ?? {};
    saveSpacerInstanceSettings(instanceId, { ...current, gradient: style });
    return;
  }

  localStorage.setItem(spacerGradientStorageKey, JSON.stringify(style));
}

export { defaultSpacerGradientStyle };
