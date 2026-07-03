import type { ColorThemeId } from "@/lib/color-themes";
import { loadContactPreviewSettings } from "@/lib/contact-preview-storage";
import { loadFooterV1PreviewSettings } from "@/lib/footer-v1-preview-storage";
import { loadFooterV3PreviewSettings } from "@/lib/footer-v3-preview-storage";
import { loadHeaderV3PreviewSettings } from "@/lib/header-v3-storage";
import { loadHeroBannerPreviewSettings } from "@/lib/hero-banner-preview-storage";
import { loadHeroV1PreviewSettings } from "@/lib/hero-v1-preview-storage";
import { loadHeroV21PreviewSettings } from "@/lib/hero-v21-preview-storage";
import { loadNavBarPreviewSettings } from "@/lib/nav-bar-preview-storage";
import { loadPortfolioPreviewSettings } from "@/lib/portfolio-preview-storage";
import { loadReviewboxPreviewSettings } from "@/lib/reviewbox-preview-storage";
import { loadServicesIconsV2PreviewSettings } from "@/lib/services-icons-v2-preview-storage";
import { loadServicesV1LayoutWidth } from "@/lib/services-v1-preview-storage";
import type { SectionGroupId } from "@/lib/section-registry";
import {
  getDefaultSpacerInstanceSettings,
  type SpacerInstanceSettings,
} from "@/lib/spacer-instance-storage";
import {
  loadSectionInstanceSettings,
  saveSectionInstanceSettings,
  type SectionInstanceSettings,
} from "@/lib/section-instance-storage";
import { copyEffectiveSpacerInstanceSettings } from "@/lib/spacer-preview-storage";
import { loadTextIconsV3PreviewSettings } from "@/lib/text-icons-v3-preview-storage";
import { loadTextImagePreviewSettings } from "@/lib/text-image-preview-storage";
import { loadTextImagesPreviewSettings } from "@/lib/text-images-preview-storage";
import { loadTopBarPreviewSettings } from "@/lib/top-bar-preview-storage";
import type { PlaygroundSectionConfig } from "@/lib/playground-sections";
import { getPlaygroundSectionVariant } from "@/lib/playground-sections";

function loadGlobalSettingsForGroup(
  group: SectionGroupId,
  colorThemeId: ColorThemeId,
): SectionInstanceSettings {
  switch (group) {
    case "topBar":
      return { topBar: loadTopBarPreviewSettings() };
    case "nav":
      return { navBar: loadNavBarPreviewSettings() };
    case "header":
      return { headerV3: loadHeaderV3PreviewSettings() };
    case "hero":
      return {
        heroBanner: loadHeroBannerPreviewSettings(),
        heroV1: loadHeroV1PreviewSettings(),
        heroV21: loadHeroV21PreviewSettings(),
      };
    case "spacer":
      return { spacer: getDefaultSpacerInstanceSettings(colorThemeId) };
    case "content":
      return {
        textIconsV3: loadTextIconsV3PreviewSettings(),
        textImage: loadTextImagePreviewSettings(),
        textImages: loadTextImagesPreviewSettings(),
      };
    case "services":
      return {
        servicesV1: { layoutWidth: loadServicesV1LayoutWidth() },
        servicesIconsV2: loadServicesIconsV2PreviewSettings(),
      };
    case "reviewbox":
      return { reviewbox: loadReviewboxPreviewSettings() };
    case "portfolio":
      return { portfolio: loadPortfolioPreviewSettings() };
    case "contact":
      return { contact: loadContactPreviewSettings() };
    case "footer":
      return {
        footerV3: loadFooterV3PreviewSettings(),
        footerV1: loadFooterV1PreviewSettings(),
      };
    default:
      return {};
  }
}

export function loadEffectiveSectionInstanceSettings(
  instanceId: string,
  group: SectionGroupId,
  colorThemeId: ColorThemeId,
): SectionInstanceSettings {
  const stored = loadSectionInstanceSettings(instanceId);
  if (stored) return stored;
  return loadGlobalSettingsForGroup(group, colorThemeId);
}

export function copyEffectiveSectionInstanceSettings(
  fromId: string,
  toId: string,
  group: SectionGroupId,
  variant: string | undefined,
  colorThemeId: ColorThemeId,
): void {
  const current = loadSectionInstanceSettings(toId) ?? {};

  if (group === "spacer") {
    copyEffectiveSpacerInstanceSettings(fromId, toId, colorThemeId, variant);
    return;
  }

  const effective = structuredClone(
    loadEffectiveSectionInstanceSettings(fromId, group, colorThemeId),
  );

  saveSectionInstanceSettings(toId, { ...current, ...effective });
}

export function copyPlaygroundSectionInstanceSettingsByConfig(
  source: PlaygroundSectionConfig,
  target: PlaygroundSectionConfig,
  colorThemeId: ColorThemeId,
): void {
  if (source.group !== target.group) return;

  copyEffectiveSectionInstanceSettings(
    source.id,
    target.id,
    source.group,
    getPlaygroundSectionVariant(source),
    colorThemeId,
  );
}

export function copyPlaygroundPageSectionInstances(
  sourceSections: PlaygroundSectionConfig[],
  targetSections: PlaygroundSectionConfig[],
  colorThemeId: ColorThemeId,
): void {
  const pairCount = Math.min(sourceSections.length, targetSections.length);

  for (let index = 0; index < pairCount; index += 1) {
    const source = sourceSections[index];
    const target = targetSections[index];
    if (!source || !target) continue;

    copyPlaygroundSectionInstanceSettingsByConfig(source, target, colorThemeId);
  }
}

/** Resolve published/live settings for a section slot (unified + legacy maps). */
export function resolvePublishedSectionInstanceSettings(
  sectionId: string | undefined,
  previewSettings?: {
    sections?: Record<string, SectionInstanceSettings>;
    spacers?: Record<string, SpacerInstanceSettings>;
    contents?: Record<string, Pick<SectionInstanceSettings, "textIconsV3" | "textImage" | "textImages">>;
  },
): SectionInstanceSettings | undefined {
  if (!sectionId || !previewSettings) return undefined;

  const unified = previewSettings.sections?.[sectionId];
  const legacySpacer = previewSettings.spacers?.[sectionId];
  const legacyContent = previewSettings.contents?.[sectionId];

  if (!unified && !legacySpacer && !legacyContent) return undefined;

  return {
    ...legacyContent,
    ...unified,
    spacer: unified?.spacer ?? legacySpacer,
  };
}
