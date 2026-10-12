import type { HomepageConfig } from "@/lib/homepage-config";
import type { HeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import {
  loadSectionInstanceSettings,
  saveSectionInstanceSettings,
  sectionInstanceHasPreviewData,
  type SectionInstanceSettings,
} from "@/lib/section-instance-storage";

/** Restore per-slot preview JSON from workshop config when localStorage is still empty. */
export function seedPageSectionInstancesFromConfig(config?: HomepageConfig): void {
  if (typeof window === "undefined") return;

  const fromDisk = config?.previewSettings?.sections;
  if (!fromDisk) return;

  for (const [sectionId, diskSlot] of Object.entries(fromDisk)) {
    if (!sectionInstanceHasPreviewData(diskSlot)) continue;

    const local = loadSectionInstanceSettings(sectionId);
    const diskContactHero = diskSlot.heroV4?.showForm === true;
    const localContactHero = local?.heroV4?.showForm === true;

    // Contact-page heroes (form on, gallery off) must not keep a stale home-hero copy in localStorage.
    if (diskContactHero && !localContactHero) {
      saveSectionInstanceSettings(sectionId, {
        ...(local ?? {}),
        ...diskSlot,
        heroV4: diskSlot.heroV4,
      });
      continue;
    }

    if (!sectionInstanceHasPreviewData(local)) {
      saveSectionInstanceSettings(sectionId, { ...diskSlot });
      continue;
    }

    const merged = mergeMissingSectionFields(local!, diskSlot);
    const mergedHeroV4 = mergeMissingHeroV4Fields(local!.heroV4, diskSlot.heroV4);
    const withHero =
      mergedHeroV4 !== local!.heroV4 ? { ...merged, heroV4: mergedHeroV4 } : merged;
    if (JSON.stringify(withHero) !== JSON.stringify(local)) {
      saveSectionInstanceSettings(sectionId, withHero);
    }
  }
}

function mergeMissingHeroV4Fields(
  local: HeroV4PreviewSettings | undefined,
  disk: HeroV4PreviewSettings | undefined,
): HeroV4PreviewSettings | undefined {
  if (!disk) return local;
  if (!local) return disk;
  let changed = false;
  const next: HeroV4PreviewSettings = { ...local };
  for (const [key, diskValue] of Object.entries(disk) as [keyof HeroV4PreviewSettings, unknown][]) {
    if (diskValue === undefined || diskValue === null) continue;
    if (next[key] === undefined || next[key] === null) {
      (next as Record<string, unknown>)[key] = diskValue;
      changed = true;
    }
  }
  return changed ? next : local;
}

function mergeMissingSectionFields(
  local: SectionInstanceSettings,
  disk: SectionInstanceSettings,
): SectionInstanceSettings {
  const next: SectionInstanceSettings = { ...local };
  for (const key of Object.keys(disk) as (keyof SectionInstanceSettings)[]) {
    const diskValue = disk[key];
    if (diskValue === undefined || diskValue === null) continue;
    if (next[key] === undefined || next[key] === null) {
      (next as Record<string, unknown>)[key] = diskValue;
    }
  }
  return next;
}
