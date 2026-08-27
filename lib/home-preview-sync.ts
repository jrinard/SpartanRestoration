import type { HomepageConfig } from "@/lib/homepage-config";
import { getHomepageSections } from "@/lib/homepage-config";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import type { SectionGroupId } from "@/lib/section-registry";
import { resolveSectionVariantId } from "@/lib/section-registry";
import type { SectionInstanceSettings } from "@/lib/section-instance-storage";

type HomeGlobalBinding = {
  field: keyof SectionInstanceSettings;
  globalKey: keyof HomepagePreviewSettings;
};

/** Deep-merge: global values win at every object level. */
function mergeGlobalWins(instance: unknown, global: unknown): unknown {
  if (global === null || global === undefined) return instance;
  if (typeof global !== "object" || Array.isArray(global)) return global;
  if (typeof instance !== "object" || instance === null || Array.isArray(instance)) {
    return structuredClone(global);
  }

  const inst = instance as Record<string, unknown>;
  const glob = global as Record<string, unknown>;
  const result: Record<string, unknown> = { ...inst };

  for (const [key, globalVal] of Object.entries(glob)) {
    result[key] = mergeGlobalWins(inst[key], globalVal);
  }

  return result;
}

function homeSectionGlobalBinding(
  group: SectionGroupId,
  variant: string | undefined,
): HomeGlobalBinding | null {
  switch (group) {
    case "topBar":
      return { field: "topBar", globalKey: "topBar" };
    case "header":
      return { field: "headerV3", globalKey: "headerV3" };
    case "hero": {
      const variantId = resolveSectionVariantId(group, variant ?? "");
      if (variantId === "hero-v2.1") return { field: "heroV21", globalKey: "heroV21" };
      if (variantId === "hero-v1") return { field: "heroV1", globalKey: "heroV1" };
      if (variantId === "hero-v4") return { field: "heroV4", globalKey: "heroV4" };
      if (variantId === "hero-banner") return { field: "heroBanner", globalKey: "heroBanner" };
      return null;
    }
    case "footer": {
      const variantId = resolveSectionVariantId(group, variant ?? "");
      if (variantId === "footer-v1") return { field: "footerV1", globalKey: "footerV1" };
      if (variantId === "footer-v4") return { field: "footerV4", globalKey: "footerV4" };
      if (variantId === "footer-v3") return { field: "footerV3", globalKey: "footerV3" };
      return { field: "footerV3", globalKey: "footerV3" };
    }
    case "reviewbox":
      return { field: "reviewbox", globalKey: "reviewbox" };
    case "portfolio": {
      const variantId = resolveSectionVariantId(group, variant ?? "");
      if (variantId === "portfolio-v2") return { field: "portfolioV2", globalKey: "portfolioV2" };
      return { field: "portfolio", globalKey: "portfolio" };
    }
    case "cta":
      return { field: "ctaV1", globalKey: "ctaV1" };
    default:
      return null;
  }
}

/** Saved global previewSettings win over stale per-slot copies when rendering /preview. */
export function resolveHomeGlobalPreviewField<T>(
  globalValue: T | undefined,
  slotValue: T | undefined,
): T | undefined {
  if (globalValue === undefined && slotValue === undefined) return undefined;
  if (globalValue === undefined) return slotValue;
  if (slotValue === undefined) return globalValue;
  return mergeGlobalWins(slotValue, globalValue) as T;
}

/** Forge export + disk write — instance edits on home promote up, then slots align. */
export function normalizeHomepageConfigForSave(config: HomepageConfig): HomepageConfig {
  return reconcileHomePageGlobalPreviewSettings(promoteHomePageInstanceSettingsToGlobal(config));
}

/** Resolve preview field for render — home site-wide slots use saved global settings. */
export function resolveSectionPreviewField<T>({
  sectionId,
  group,
  variant,
  previewSettings,
  field,
  globalKey,
  homeSectionIds,
}: {
  sectionId: string | undefined;
  group: SectionGroupId;
  variant: string | undefined;
  previewSettings: HomepagePreviewSettings | undefined;
  field: keyof SectionInstanceSettings;
  globalKey: keyof HomepagePreviewSettings;
  homeSectionIds?: ReadonlySet<string>;
}): T | undefined {
  const slot = sectionId
    ? (previewSettings?.sections?.[sectionId]?.[field] as T | undefined)
    : undefined;
  const global = previewSettings?.[globalKey] as T | undefined;
  const binding = homeSectionGlobalBinding(group, variant);
  const isHomeGlobalSlot = Boolean(
    sectionId &&
      homeSectionIds?.has(sectionId) &&
      binding &&
      binding.field === field &&
      binding.globalKey === globalKey,
  );

  if (isHomeGlobalSlot) {
    return resolveHomeGlobalPreviewField(global, slot);
  }

  return slot ?? global;
}

/**
 * Forge edits site-wide home sections into per-slot instance storage. On export,
 * promote those instance values into global previewSettings keys (instance wins)
 * before reconcile aligns slots back from global.
 */
export function promoteHomePageInstanceSettingsToGlobal(
  config: HomepageConfig,
): HomepageConfig {
  const previewSettings = config.previewSettings;
  if (!previewSettings?.sections) return config;

  let nextSettings: HomepagePreviewSettings = { ...previewSettings };
  let changed = false;

  for (const entry of getHomepageSections(config)) {
    if (!entry.id) continue;

    const binding = homeSectionGlobalBinding(entry.group, entry.variant);
    if (!binding) continue;

    const slot = previewSettings.sections[entry.id];
    const instanceValue = slot?.[binding.field];
    if (instanceValue === null || instanceValue === undefined) continue;

    const globalValue = previewSettings[binding.globalKey];
    const promoted = mergeGlobalWins(globalValue, instanceValue);
    if (JSON.stringify(promoted) === JSON.stringify(globalValue)) continue;

    nextSettings = { ...nextSettings, [binding.globalKey]: promoted as never };
    changed = true;
  }

  if (!changed) return config;

  return {
    ...config,
    previewSettings: nextSettings,
  };
}

/**
 * previewSettings keys. Page cloning can leave stale per-slot copies in
 * previewSettings.sections — align home slots with global before pull/load/publish.
 *
 * Intentionally skipped: spacers, services, content blocks, reviews — those are
 * meant to differ per slot/page.
 */
export function reconcileHomePageGlobalPreviewSettings(config: HomepageConfig): HomepageConfig {
  const previewSettings = config.previewSettings;
  if (!previewSettings?.sections) return config;

  let sections = previewSettings.sections;
  let changed = false;

  for (const entry of getHomepageSections(config)) {
    if (!entry.id) continue;

    const binding = homeSectionGlobalBinding(entry.group, entry.variant);
    if (!binding) continue;

    const globalValue = previewSettings[binding.globalKey];
    if (globalValue === null || globalValue === undefined) continue;

    const slot = sections[entry.id];
    if (!slot) continue;

    const instanceValue = slot[binding.field];
    if (instanceValue === null || instanceValue === undefined) continue;

    const merged = mergeGlobalWins(instanceValue, globalValue);
    if (JSON.stringify(merged) === JSON.stringify(instanceValue)) continue;

    sections = {
      ...sections,
      [entry.id]: {
        ...slot,
        [binding.field]: merged,
      },
    };
    changed = true;
  }

  if (!changed) return config;

  return {
    ...config,
    previewSettings: {
      ...previewSettings,
      sections,
    },
  };
}

/** @deprecated Use reconcileHomePageGlobalPreviewSettings */
export function reconcileHomeHeroV21Button(config: HomepageConfig): HomepageConfig {
  return reconcileHomePageGlobalPreviewSettings(config);
}

export function getHomeHeroV21SectionId(config: HomepageConfig): string | undefined {
  for (const entry of getHomepageSections(config)) {
    if (entry.group !== "hero" || !entry.id) continue;
    if (resolveSectionVariantId(entry.group, entry.variant ?? "") === "hero-v2.1") {
      return entry.id;
    }
  }
  return undefined;
}
