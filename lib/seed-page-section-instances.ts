import type { HomepageConfig } from "@/lib/homepage-config";
import type { TextImagesPreviewSettings } from "@/lib/text-images-preview";
import type { HeroV4PreviewSettings } from "@/lib/hero-v4-preview";
import { mergePortfolioV3FromCommitted } from "@/lib/portfolio-v3-preview";
import { normalizePortfolioV3PreviewSettings } from "@/lib/portfolio-v3-preview-storage";
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
    const diskGalleryHero =
      diskSlot.heroV4?.showGallery === true && diskSlot.heroV4?.showForm === false;
    const localFormHero =
      local?.heroV4?.showForm === true && local?.heroV4?.showGallery !== true;

    // Contact-page heroes (form on, gallery off) must not keep a stale home-hero copy in localStorage.
    // Gallery heroes (form off, gallery on) must not keep a stale form copy when staging.json changes.
    if (
      (diskContactHero && !localContactHero) ||
      (diskGalleryHero && localFormHero)
    ) {
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
    const withPortfolioV3 = mergePortfolioV3SectionFields(withHero, diskSlot);
    const withServices = mergeServicesIconsV2SectionFields(withPortfolioV3, diskSlot);
    const withTextImages = mergeTextImagesSectionFields(withServices, diskSlot);
    if (JSON.stringify(withTextImages) !== JSON.stringify(local)) {
      saveSectionInstanceSettings(sectionId, withTextImages);
    }
  }
}

/** Sync row image alt from disk when src matches — e.g. library swap without alt update in localStorage. */
function mergeTextImagesSectionFields(
  local: SectionInstanceSettings,
  disk: SectionInstanceSettings,
): SectionInstanceSettings {
  const diskTi = disk.textImages;
  const localTi = local.textImages;
  if (!diskTi || !localTi) return local;

  let changed = false;
  const nextTi: TextImagesPreviewSettings = { ...localTi };
  for (const row of [1, 2, 3] as const) {
    const diskSrc =
      row === 1
        ? diskTi.contentRow1ImageSrc?.trim()
        : row === 2
          ? diskTi.contentRow2ImageSrc?.trim()
          : diskTi.contentRow3ImageSrc?.trim();
    const localSrc =
      row === 1
        ? localTi.contentRow1ImageSrc?.trim()
        : row === 2
          ? localTi.contentRow2ImageSrc?.trim()
          : localTi.contentRow3ImageSrc?.trim();
    const diskAlt =
      row === 1
        ? diskTi.contentRow1ImageAlt?.trim()
        : row === 2
          ? diskTi.contentRow2ImageAlt?.trim()
          : diskTi.contentRow3ImageAlt?.trim();
    if (!diskSrc || !diskAlt || localSrc !== diskSrc) continue;
    const localAlt =
      row === 1
        ? localTi.contentRow1ImageAlt?.trim()
        : row === 2
          ? localTi.contentRow2ImageAlt?.trim()
          : localTi.contentRow3ImageAlt?.trim();
    if (localAlt === diskAlt) continue;
    if (row === 1) nextTi.contentRow1ImageAlt = diskAlt;
    else if (row === 2) nextTi.contentRow2ImageAlt = diskAlt;
    else nextTi.contentRow3ImageAlt = diskAlt;
    changed = true;
  }
  if (!changed) return local;
  return { ...local, textImages: nextTi };
}

/** Fill missing per-service `href` from committed JSON when Forge localStorage is stale. */
function mergeServicesIconsV2SectionFields(
  local: SectionInstanceSettings,
  disk: SectionInstanceSettings,
): SectionInstanceSettings {
  const diskServices = disk.servicesIconsV2?.services;
  const localServices = local.servicesIconsV2?.services;
  if (!diskServices?.length || !localServices?.length) return local;

  const hrefById = new Map(
    diskServices
      .filter((s) => typeof s.href === "string" && s.href.trim())
      .map((s) => [s.id, s.href!.trim()] as const),
  );
  if (hrefById.size === 0) return local;

  let changed = false;
  const mergedServices = localServices.map((s) => {
    const diskHref = hrefById.get(s.id);
    if (!diskHref) return s;
    if (typeof s.href === "string" && s.href.trim()) return s;
    changed = true;
    return { ...s, href: diskHref };
  });
  if (!changed) return local;
  return {
    ...local,
    servicesIconsV2: { ...local.servicesIconsV2!, services: mergedServices },
  };
}

function mergePortfolioV3SectionFields(
  local: SectionInstanceSettings,
  disk: SectionInstanceSettings,
): SectionInstanceSettings {
  if (!disk.portfolioV3 || !local.portfolioV3) {
    if (disk.portfolioV3 && !local.portfolioV3) {
      return { ...local, portfolioV3: normalizePortfolioV3PreviewSettings(disk.portfolioV3) };
    }
    return local;
  }
  const diskNorm = normalizePortfolioV3PreviewSettings(disk.portfolioV3);
  const localNorm = normalizePortfolioV3PreviewSettings(local.portfolioV3);
  const merged = mergePortfolioV3FromCommitted(localNorm, diskNorm);
  if (merged === localNorm) return local;
  return { ...local, portfolioV3: merged };
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
