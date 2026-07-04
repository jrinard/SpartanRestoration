import {
  defaultSpacerGradientStyle,
  type SpacerGradientStyle,
  type SpacerStripeStyle,
} from "@/components/sections/Spacer";
import type { ColorThemeId } from "@/lib/color-themes";
import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";
import { getDefaultSpacerStripeStyleForVariant } from "@/lib/spacer-defaults";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import {
  loadSpacerInstanceSettings,
  saveSpacerInstanceSettings,
  defaultSpacerLayoutWidth,
  defaultSpacerOuterBackgroundColor,
  type SpacerInstanceSettings,
} from "@/lib/spacer-instance-storage";

export const spacerStripeStorageKey = "lifespring-spacer-stripe-style";
export const spacerGradientStorageKey = "lifespring-spacer-gradient-style";

function isSiteLayoutWidth(value: unknown): value is SiteLayoutWidth {
  return value === "contained" || value === "full";
}

function normalizeSpacerStripeStyle(
  style: SpacerStripeStyle,
  colorThemeId: ColorThemeId,
  variantId?: string,
): SpacerStripeStyle {
  const defaults = getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId);
  const { layoutWidth: _legacyLayoutWidth, ...rest } = style as SpacerStripeStyle & {
    layoutWidth?: SiteLayoutWidth;
  };

  return {
    ...defaults,
    ...rest,
    overlap: style.overlap === true,
  };
}

export function normalizeSpacerLayoutWidth(
  settings: Partial<SpacerInstanceSettings> & {
    stripe?: Partial<SpacerStripeStyle> & { layoutWidth?: SiteLayoutWidth };
  },
): SiteLayoutWidth {
  if (isSiteLayoutWidth(settings.layoutWidth)) {
    return settings.layoutWidth;
  }

  if (isSiteLayoutWidth(settings.stripe?.layoutWidth)) {
    return settings.stripe.layoutWidth;
  }

  return defaultSpacerLayoutWidth;
}

export function loadSpacerLayoutWidth(instanceId?: string, variantId?: string): SiteLayoutWidth {
  const committed = getCommittedSpacerSettings(instanceId);
  if (committed) {
    return normalizeSpacerLayoutWidth(committed);
  }

  if (instanceId) {
    const instance = loadSpacerInstanceSettings(instanceId);
    if (instance) {
      return normalizeSpacerLayoutWidth(instance);
    }

    if (variantId === "spacer-v3") {
      return "contained";
    }

    return defaultSpacerLayoutWidth;
  }

  if (typeof window === "undefined") {
    return defaultSpacerLayoutWidth;
  }

  const legacy = loadLegacyStripeFromStorage();
  if (legacy) {
    return normalizeSpacerLayoutWidth({ stripe: legacy });
  }

  if (variantId === "spacer-v3") {
    return "contained";
  }

  return defaultSpacerLayoutWidth;
}

export function saveSpacerLayoutWidth(layoutWidth: SiteLayoutWidth, instanceId?: string): void {
  if (typeof window === "undefined") return;

  if (instanceId) {
    const current = loadSpacerInstanceSettings(instanceId) ?? {};
    saveSpacerInstanceSettings(instanceId, { ...current, layoutWidth });
    return;
  }

  const legacy = loadLegacyStripeFromStorage();
  if (legacy) {
    localStorage.setItem(
      spacerStripeStorageKey,
      JSON.stringify({ ...legacy, layoutWidth }),
    );
  }
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeSpacerOuterBackgroundColor(value: unknown): string {
  return isHexColor(value) ? value : defaultSpacerOuterBackgroundColor;
}

export function loadSpacerOuterBackgroundColor(instanceId?: string): string {
  const committed = getCommittedSpacerSettings(instanceId);
  if (committed?.outerBackgroundColor) {
    return normalizeSpacerOuterBackgroundColor(committed.outerBackgroundColor);
  }

  if (instanceId) {
    const instance = loadSpacerInstanceSettings(instanceId);
    if (instance?.outerBackgroundColor) {
      return normalizeSpacerOuterBackgroundColor(instance.outerBackgroundColor);
    }
  }

  return defaultSpacerOuterBackgroundColor;
}

export function saveSpacerOuterBackgroundColor(
  outerBackgroundColor: string,
  instanceId?: string,
): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeSpacerOuterBackgroundColor(outerBackgroundColor);

  if (instanceId) {
    const current = loadSpacerInstanceSettings(instanceId) ?? {};
    saveSpacerInstanceSettings(instanceId, { ...current, outerBackgroundColor: normalized });
  }
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
  if (shouldUsePlaygroundPreviewSettings()) {
    return undefined;
  }

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

    return getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId);
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

    return defaultSpacerGradientStyle;
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

/** Persist default stripe settings for a slot so it no longer shares legacy global storage. */
export function ensureSpacerStripeInstance(
  instanceId: string,
  colorThemeId: ColorThemeId,
  variantId?: string,
): SpacerStripeStyle {
  const instance = loadSpacerInstanceSettings(instanceId);
  if (instance?.stripe) {
    return normalizeSpacerStripeStyle(instance.stripe, colorThemeId, variantId);
  }

  const stripe = getDefaultSpacerStripeStyleForVariant(variantId, colorThemeId);
  saveSpacerStripeStyle(stripe, instanceId);
  return stripe;
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

/** Copy the spacer settings currently shown in the playground (instance + legacy fallbacks). */
export function copyEffectiveSpacerInstanceSettings(
  fromId: string,
  toId: string,
  colorThemeId: ColorThemeId,
  variantId?: string,
): void {
  saveSpacerInstanceSettings(toId, {
    stripe: loadSpacerStripeStyle(colorThemeId, fromId, variantId),
    gradient: loadSpacerGradientStyle(fromId),
    layoutWidth: loadSpacerLayoutWidth(fromId, variantId),
    outerBackgroundColor: loadSpacerOuterBackgroundColor(fromId),
  });
}

export { defaultSpacerGradientStyle };
