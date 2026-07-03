import type { ColorThemeId } from "@/lib/color-themes";
import { defaultColorThemeId } from "@/lib/color-themes";
import type { FontThemeId } from "@/lib/creative-themes";
import { defaultFontThemeId } from "@/lib/creative-themes";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import type { SectionGroupId } from "@/lib/section-registry";

export type HomepageSectionEntry = {
  group: SectionGroupId;
  variant?: string;
  /** Unique section slot id — every published section carries its instance settings. */
  id?: string;
};

/** Published homepage layout + theme settings from the playground. */
export type HomepageConfig = {
  sections: HomepageSectionEntry[];
  colorThemeId: ColorThemeId;
  fontThemeId: FontThemeId;
  previewSettings?: HomepagePreviewSettings;
};

/** Fallback stack when nothing has been published from the playground yet. */
export const defaultLiveHomepageSections: HomepageSectionEntry[] = [
  { group: "topBar", variant: "top-bar-v1" },
  { group: "header", variant: "header-v3" },
  { group: "hero", variant: "hero-v2.1" },
  { group: "services", variant: "services-v1" },
  { group: "portfolio", variant: "portfolio-v1" },
  { group: "reviewbox", variant: "reviewbox-v1" },
  { group: "footer", variant: "footer-v3" },
];

export function getHomepageSections(config: HomepageConfig): HomepageSectionEntry[] {
  return config.sections.length > 0 ? config.sections : defaultLiveHomepageSections;
}

function isSectionGroupId(value: unknown): value is SectionGroupId {
  return typeof value === "string";
}

export function normalizeHomepageConfig(value: unknown): HomepageConfig {
  const config = (value && typeof value === "object" ? value : {}) as Partial<HomepageConfig>;

  const sections = Array.isArray(config.sections)
    ? config.sections.flatMap((entry) => {
        if (!entry || typeof entry !== "object" || !("group" in entry)) return [];
        const group = entry.group;
        if (!isSectionGroupId(group)) return [];
        return [
          {
            group,
            variant: "variant" in entry && typeof entry.variant === "string" ? entry.variant : undefined,
            id: "id" in entry && typeof entry.id === "string" ? entry.id : undefined,
          },
        ];
      })
    : [];

  return {
    sections,
    colorThemeId: (config.colorThemeId as ColorThemeId | undefined) ?? defaultColorThemeId,
    fontThemeId: (config.fontThemeId as FontThemeId | undefined) ?? defaultFontThemeId,
    previewSettings:
      config.previewSettings && typeof config.previewSettings === "object"
        ? (config.previewSettings as HomepagePreviewSettings)
        : undefined,
  };
}
