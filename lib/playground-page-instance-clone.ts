import type { ColorThemeId } from "@/lib/color-themes";
import { copyEffectiveContentInstanceSettings } from "@/lib/content-instance-storage";
import {
  getPlaygroundPageSections,
  homePlaygroundPageId,
  loadPlaygroundPagesState,
  type PlaygroundPagesState,
} from "@/lib/playground-pages";
import {
  getPlaygroundSectionVariant,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";
import { copyEffectiveSpacerInstanceSettings } from "@/lib/spacer-preview-storage";

export const playgroundPageInstanceRepairKey = "lifespring-playground-spacer-repair";
export const playgroundPageInstanceRepairVersion = "3";

/** @deprecated Use playgroundPageInstanceRepairKey */
export const playgroundSpacerRepairKey = playgroundPageInstanceRepairKey;

/** @deprecated Use playgroundPageInstanceRepairVersion */
export const playgroundSpacerRepairVersion = playgroundPageInstanceRepairVersion;

function copySpacerSettingsByOrder(
  sourceSections: PlaygroundSectionConfig[],
  targetSections: PlaygroundSectionConfig[],
  colorThemeId: ColorThemeId,
): void {
  const sourceSpacers = sourceSections.filter((section) => section.group === "spacer");
  const targetSpacers = targetSections.filter((section) => section.group === "spacer");
  const pairCount = Math.min(sourceSpacers.length, targetSpacers.length);

  for (let index = 0; index < pairCount; index += 1) {
    const source = sourceSpacers[index];
    const target = targetSpacers[index];
    if (!source || !target) continue;

    copyEffectiveSpacerInstanceSettings(
      source.id,
      target.id,
      colorThemeId,
      getPlaygroundSectionVariant(source),
    );
  }
}

function copyContentSettingsByOrder(
  sourceSections: PlaygroundSectionConfig[],
  targetSections: PlaygroundSectionConfig[],
): void {
  const sourceContents = sourceSections.filter((section) => section.group === "content");
  const targetContents = targetSections.filter((section) => section.group === "content");
  const pairCount = Math.min(sourceContents.length, targetContents.length);

  for (let index = 0; index < pairCount; index += 1) {
    const source = sourceContents[index];
    const target = targetContents[index];
    if (!source || !target) continue;

    copyEffectiveContentInstanceSettings(
      source.id,
      target.id,
      getPlaygroundSectionVariant(source),
    );
  }
}

export function copyPlaygroundSectionInstanceSettings(
  sourceSections: PlaygroundSectionConfig[],
  targetSections: PlaygroundSectionConfig[],
  colorThemeId: ColorThemeId,
): void {
  const pairCount = Math.min(sourceSections.length, targetSections.length);

  for (let index = 0; index < pairCount; index += 1) {
    const source = sourceSections[index];
    const target = targetSections[index];
    if (!source || !target || source.group !== target.group) continue;

    if (source.group === "spacer") {
      copyEffectiveSpacerInstanceSettings(
        source.id,
        target.id,
        colorThemeId,
        getPlaygroundSectionVariant(source),
      );
    } else if (source.group === "content") {
      copyEffectiveContentInstanceSettings(
        source.id,
        target.id,
        getPlaygroundSectionVariant(source),
      );
    }
  }
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

    copySpacerSettingsByOrder(homeSections, pageSections, colorThemeId);
    copyContentSettingsByOrder(homeSections, pageSections);
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
  repairPlaygroundPageInstancesFromHome(state, colorThemeId);
  localStorage.setItem(playgroundPageInstanceRepairKey, playgroundPageInstanceRepairVersion);
}

/** @deprecated Use runPlaygroundPageInstanceRepairIfNeeded */
export function runPlaygroundSpacerRepairIfNeeded(colorThemeId: ColorThemeId): void {
  runPlaygroundPageInstanceRepairIfNeeded(colorThemeId);
}
