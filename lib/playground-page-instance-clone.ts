import type { ColorThemeId } from "@/lib/color-themes";
import {
  copyEffectiveSectionInstanceSettings,
  copyPlaygroundPageSectionInstances,
  copyPlaygroundSectionInstanceSettingsByConfig,
} from "@/lib/section-instance-copy";
import { stripNavBarFromAllSectionInstances } from "@/lib/section-instance-storage";
import {
  getPlaygroundPageSections,
  homePlaygroundPageId,
  loadPlaygroundPagesState,
  type PlaygroundPagesState,
} from "@/lib/playground-pages";
import type { PlaygroundSectionConfig } from "@/lib/playground-sections";

export const playgroundPageInstanceRepairKey = "lifespring-playground-spacer-repair";
export const playgroundPageInstanceRepairVersion = "6";

/** @deprecated Use playgroundPageInstanceRepairKey */
export const playgroundSpacerRepairKey = playgroundPageInstanceRepairKey;

/** @deprecated Use playgroundPageInstanceRepairVersion */
export const playgroundSpacerRepairVersion = playgroundPageInstanceRepairVersion;

export function copyPlaygroundSectionInstanceSettings(
  sourceSections: PlaygroundSectionConfig[],
  targetSections: PlaygroundSectionConfig[],
  colorThemeId: ColorThemeId,
): void {
  copyPlaygroundPageSectionInstances(sourceSections, targetSections, colorThemeId);
}

export function repairPlaygroundPageInstancesFromHome(
  state: PlaygroundPagesState,
  colorThemeId: ColorThemeId,
): void {
  if (typeof window === "undefined") return;

  const homeSections = getPlaygroundPageSections(state, homePlaygroundPageId);

  for (const page of state.pages) {
    if (page.isHome) continue;

    const pageSections = state.sectionsByPageId[page.id];
    if (!pageSections?.length) continue;

    copyPlaygroundPageSectionInstances(homeSections, pageSections, colorThemeId, {
      includeSpacers: false,
    });
  }
}

/** @deprecated Use repairPlaygroundPageInstancesFromHome */
export function repairPlaygroundPageSpacersFromHome(
  state: PlaygroundPagesState,
  colorThemeId: ColorThemeId,
): void {
  repairPlaygroundPageInstancesFromHome(state, colorThemeId);
}

export function runPlaygroundPageInstanceRepairIfNeeded(colorThemeId: ColorThemeId): void {
  if (typeof window === "undefined") return;

  const repairedVersion = localStorage.getItem(playgroundPageInstanceRepairKey);
  if (repairedVersion === playgroundPageInstanceRepairVersion) return;

  const state = loadPlaygroundPagesState();
  stripNavBarFromAllSectionInstances();
  repairPlaygroundPageInstancesFromHome(state, colorThemeId);
  localStorage.setItem(playgroundPageInstanceRepairKey, playgroundPageInstanceRepairVersion);
}

/** @deprecated Use runPlaygroundPageInstanceRepairIfNeeded */
export function runPlaygroundSpacerRepairIfNeeded(colorThemeId: ColorThemeId): void {
  runPlaygroundPageInstanceRepairIfNeeded(colorThemeId);
}

export {
  copyEffectiveSectionInstanceSettings,
  copyPlaygroundSectionInstanceSettingsByConfig,
};
