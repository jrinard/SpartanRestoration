import { defaultColorThemeId } from "@/lib/color-themes";
import { defaultFontThemeId } from "@/lib/creative-themes";
import { getClientOrgId } from "@/lib/org/browser-storage";
import {
  loadSectionInstanceSettings,
  saveSectionInstanceSettings,
} from "@/lib/section-instance-storage";
import { fillMissingSectionCopy } from "@/lib/org/migrate-section-copy";
import type { PlaygroundSectionConfig } from "@/lib/playground-sections";
import { getPlaygroundSectionVariant } from "@/lib/playground-sections";

/**
 * When a section is shown or added to preview, copy add-section defaults into
 * that slot's instance JSON if copy is not already saved.
 */
export function seedSectionCopyIfMissing(section: PlaygroundSectionConfig): void {
  if (typeof window === "undefined") return;

  const orgId = getClientOrgId() || "lsd";
  const variant = getPlaygroundSectionVariant(section);
  const config = {
    sections: [
      {
        group: section.group,
        variant,
        id: section.id,
      },
    ],
    colorThemeId: defaultColorThemeId,
    fontThemeId: defaultFontThemeId,
    previewSettings: {
      sections: {
        [section.id]: loadSectionInstanceSettings(section.id) ?? {},
      },
    },
  };

  const { config: filled, changed } = fillMissingSectionCopy(config, orgId, {
    production: false,
  });
  if (!changed) return;

  const next = filled.previewSettings?.sections?.[section.id];
  if (!next) return;
  saveSectionInstanceSettings(section.id, next);
}
