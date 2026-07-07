import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  loadSectionInstanceField,
  type SectionInstanceField,
  type SectionInstanceSettings,
} from "@/lib/section-instance-storage";

/**
 * Playground /preview routes have no published homepage snapshot — read the live
 * section slot from localStorage instead of falling back to component defaults.
 */
export function loadPlaygroundSectionPreviewField<K extends SectionInstanceField>(
  sectionId: string | undefined,
  previewSettings: HomepagePreviewSettings | undefined,
  field: K,
  publishedValue: SectionInstanceSettings[K] | undefined,
): SectionInstanceSettings[K] | undefined {
  if (previewSettings) return publishedValue;
  if (!sectionId) return undefined;
  return loadSectionInstanceField(sectionId, field);
}
