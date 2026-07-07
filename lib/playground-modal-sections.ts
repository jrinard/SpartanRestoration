import type { SectionGroupId } from "@/lib/section-registry";
import type { PlaygroundSectionConfig } from "@/lib/playground-sections";

/**
 * Sections edited in the playground but never placed on the page layout.
 * They load in overlays (contact modal, future modals, etc.).
 */
export const playgroundModalOnlySectionGroups = new Set<SectionGroupId>(["contact"]);

export function isPlaygroundModalOnlySection(group: SectionGroupId): boolean {
  return playgroundModalOnlySectionGroups.has(group);
}

export function getPlaygroundModalOnlySections(
  sections: readonly PlaygroundSectionConfig[],
): PlaygroundSectionConfig[] {
  return sections.filter((section) => isPlaygroundModalOnlySection(section.group));
}

/** Page layout sections — excludes modal-only slots. */
export function getPlaygroundPageLayoutSections(
  sections: readonly PlaygroundSectionConfig[],
): PlaygroundSectionConfig[] {
  return sections.filter((section) => !isPlaygroundModalOnlySection(section.group));
}

export function findPlaygroundModalSectionId(
  sections: readonly PlaygroundSectionConfig[],
  group: SectionGroupId,
): string | undefined {
  return sections.find((section) => section.group === group)?.id;
}

export function getPlaygroundModalSectionLabel(group: SectionGroupId): string {
  switch (group) {
    case "contact":
      return "Contact popup";
    default:
      return "Modal section";
  }
}

export function getPlaygroundModalSectionHint(group: SectionGroupId): string {
  switch (group) {
    case "contact":
      return "Opens when a nav link targets Contact (popup). Not placed on the page.";
    default:
      return "Opens from navigation or a trigger — not placed on the page.";
  }
}
