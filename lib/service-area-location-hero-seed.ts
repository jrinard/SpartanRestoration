import type { HomepageConfig } from "@/lib/homepage-config";
import { getClientOrgId } from "@/lib/org/browser-storage";
import {
  loadAllSectionInstanceSettings,
  loadSectionInstanceField,
  saveSectionInstanceField,
  saveSectionInstanceSettings,
} from "@/lib/section-instance-storage";
import {
  buildServiceAreaLocationHeroV4,
  getServiceAreaLocationDefinition,
  isGenericServiceAreaHeroHeadline,
} from "@/lib/service-area-location-content";
import { loadHeroV4PreviewSettings } from "@/lib/hero-v4-preview-storage";
import {
  getPlaygroundPageSections,
  type PlaygroundPagesState,
} from "@/lib/playground-pages";

function findPageHeroV4Id(state: PlaygroundPagesState, pageId: string): string | undefined {
  return getPlaygroundPageSections(state, pageId).find(
    (section) => section.group === "hero" && (section.variant === "hero-v4" || !section.variant),
  )?.id;
}

/** Write unique city Hero-v4 copy into playground instance storage when the slot is still generic. */
export function seedServiceAreaLocationHeroes(
  state: PlaygroundPagesState,
  config?: HomepageConfig,
): void {
  if (typeof window === "undefined") return;
  if (getClientOrgId() !== "lsd") return;

  const instances = loadAllSectionInstanceSettings();
  for (const page of config?.pages ?? []) {
    if (!getServiceAreaLocationDefinition(page.slug)) continue;
    for (const section of page.sections) {
      if (!section.id) continue;
      const incoming = config?.previewSettings?.sections?.[section.id];
      if (!incoming) continue;
      saveSectionInstanceSettings(section.id, {
        ...instances[section.id],
        ...incoming,
      });
    }
  }

  const clarkPage = state.pages.find(
    (page) => page.slug === "clark-county-wa" || page.slug === "service-areas/clark-county-wa",
  );
  const clarkHeroId = clarkPage ? findPageHeroV4Id(state, clarkPage.id) : undefined;
  const clarkBase =
    (clarkHeroId ? loadSectionInstanceField(clarkHeroId, "heroV4") : undefined) ??
    (clarkHeroId ? config?.previewSettings?.sections?.[clarkHeroId]?.heroV4 : undefined) ??
    loadHeroV4PreviewSettings();

  for (const page of state.pages) {
    const location = getServiceAreaLocationDefinition(page.slug);
    if (!location || location.slug === "clark-county-wa") continue;

    const heroId = findPageHeroV4Id(state, page.id);
    if (!heroId) continue;

    const existing =
      loadSectionInstanceField(heroId, "heroV4") ??
      config?.previewSettings?.sections?.[heroId]?.heroV4;
    if (existing && !isGenericServiceAreaHeroHeadline(existing.headline)) continue;

    saveSectionInstanceField(
      heroId,
      "heroV4",
      buildServiceAreaLocationHeroV4(location, clarkBase ?? existing),
    );
  }
}
