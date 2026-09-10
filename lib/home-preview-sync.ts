import type { HomepageConfig } from "@/lib/homepage-config";
import { getHomepageSections } from "@/lib/homepage-config";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import { isPlaygroundChromeSectionGroup } from "@/lib/playground-section-scope";
import { sanitizeHomepageConfigForPublish } from "@/lib/publish-sanitize";
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
  if (!isPlaygroundChromeSectionGroup(group)) return null;

  switch (group) {
    case "topBar": {
      const variantId = resolveSectionVariantId(group, variant ?? "");
      if (variantId === "top-bar-v2") return { field: "topBarV2", globalKey: "topBarV2" };
      return { field: "topBar", globalKey: "topBar" };
    }
    case "header":
      return { field: "headerV3", globalKey: "headerV3" };
    case "nav":
      return { field: "navBar", globalKey: "navBar" };
    case "footer": {
      const variantId = resolveSectionVariantId(group, variant ?? "");
      if (variantId === "footer-v1") return { field: "footerV1", globalKey: "footerV1" };
      if (variantId === "footer-v4") return { field: "footerV4", globalKey: "footerV4" };
      if (variantId === "footer-v3") return { field: "footerV3", globalKey: "footerV3" };
      return { field: "footerV3", globalKey: "footerV3" };
    }
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
  return sanitizeHomepageConfigForPublish(
    reconcileHomePageGlobalPreviewSettings(promoteHomePageInstanceSettingsToGlobal(config)),
  );
}

/** Resolve preview field for render — home site-wide slots use saved global settings. */
export function resolveSectionPreviewField<T>({
  sectionId,
  group,
  variant,
  previewSettings,
  field,
  globalKey,
}: {
  sectionId: string | undefined;
  group: SectionGroupId;
  variant: string | undefined;
  previewSettings: HomepagePreviewSettings | undefined;
  field: keyof SectionInstanceSettings;
  globalKey: keyof HomepagePreviewSettings;
  /** @deprecated Chrome is site-wide on every page; unused. */
  homeSectionIds?: ReadonlySet<string>;
}): T | undefined {
  const slot = sectionId
    ? (previewSettings?.sections?.[sectionId]?.[field] as T | undefined)
    : undefined;
  const global = previewSettings?.[globalKey] as T | undefined;
  const binding = homeSectionGlobalBinding(group, variant);
  const isSiteWideChrome = Boolean(
    binding && binding.field === field && binding.globalKey === globalKey,
  );

  // Chrome is shared on every page. Heroes and other cloned sections use the
  // per-slot copy — do not let the home global overwrite an inner-page edit.
  if (isSiteWideChrome) {
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
    // Chrome is edited in global storage. A stale per-slot copy (e.g. cloned
    // header nav links) must not overwrite the live labels on Save to /preview.
    const promoted = mergeGlobalWins(instanceValue, globalValue);
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
 * Intentionally skipped: heroes, spacers, services, content, reviews, portfolio,
 * CTA — those stay per slot/page after a clone.
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
