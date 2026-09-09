import type { ColorThemeId } from "@/lib/color-themes";
import {
  copyEffectiveSectionInstanceSettings,
  copyPlaygroundChromeSectionInstances,
  copyPlaygroundPageSectionInstances,
  copyPlaygroundSectionInstanceSettingsByConfig,
} from "@/lib/section-instance-copy";
import { stripNavBarFromAllSectionInstances } from "@/lib/section-instance-storage";
import {
  getPlaygroundPageSections,
  homePlaygroundPageId,
  loadPlaygroundPagesState,
  savePlaygroundPagesState,
  type PlaygroundPagesState,
} from "@/lib/playground-pages";
import { bindPlaygroundChromeSectionIds } from "@/lib/playground-section-scope";
import type { PlaygroundSectionConfig } from "@/lib/playground-sections";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const playgroundPageInstanceRepairKey = "lifespring-playground-spacer-repair";
export const playgroundPageInstanceRepairVersion = "7";

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
  let sectionsByPageId = state.sectionsByPageId;
  let changed = false;

  for (const page of state.pages) {
    if (page.isHome) continue;

    const pageSections = sectionsByPageId[page.id];
    if (!pageSections?.length) continue;

    const bound = bindPlaygroundChromeSectionIds(homeSections, pageSections);
    if (bound !== pageSections && JSON.stringify(bound) !== JSON.stringify(pageSections)) {
      sectionsByPageId = { ...sectionsByPageId, [page.id]: bound };
      changed = true;
    }
    copyPlaygroundChromeSectionInstances(homeSections, bound, colorThemeId);
  }

  if (changed) {
    savePlaygroundPagesState({ ...state, sectionsByPageId });
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

  const repairedVersion = orgStorageGet(playgroundPageInstanceRepairKey);
  if (repairedVersion === playgroundPageInstanceRepairVersion) return;

  const state = loadPlaygroundPagesState();
  stripNavBarFromAllSectionInstances();
  repairPlaygroundPageInstancesFromHome(state, colorThemeId);
  orgStorageSet(playgroundPageInstanceRepairKey, playgroundPageInstanceRepairVersion);
}

/** @deprecated Use runPlaygroundPageInstanceRepairIfNeeded */
export function runPlaygroundSpacerRepairIfNeeded(colorThemeId: ColorThemeId): void {
  runPlaygroundPageInstanceRepairIfNeeded(colorThemeId);
}

export {
  copyEffectiveSectionInstanceSettings,
  copyPlaygroundSectionInstanceSettingsByConfig,
};
