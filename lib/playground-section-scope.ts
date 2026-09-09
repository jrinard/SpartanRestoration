import type { PlaygroundSectionConfig } from "@/lib/playground-sections";
import type { SectionGroupId } from "@/lib/section-registry";

/**
 * Shared chrome — one setting across pages (nav, header, top bar, footer).
 * Heroes, content, services, and reviews stay per-page after a clone.
 */
export const playgroundChromeSectionGroups = [
  "topBar",
  "nav",
  "header",
  "footer",
] as const satisfies readonly SectionGroupId[];

export type PlaygroundChromeSectionGroup = (typeof playgroundChromeSectionGroups)[number];

export function isPlaygroundChromeSectionGroup(
  group: SectionGroupId,
): group is PlaygroundChromeSectionGroup {
  return (playgroundChromeSectionGroups as readonly SectionGroupId[]).includes(group);
}

/** Reuse home top bar / nav / header / footer ids so inner pages share one chrome. */
export function bindPlaygroundChromeSectionIds(
  homeSections: readonly PlaygroundSectionConfig[],
  pageSections: readonly PlaygroundSectionConfig[],
): PlaygroundSectionConfig[] {
  const homeByGroup = new Map<SectionGroupId, PlaygroundSectionConfig>();
  for (const section of homeSections) {
    if (!isPlaygroundChromeSectionGroup(section.group)) continue;
    if (!homeByGroup.has(section.group)) homeByGroup.set(section.group, section);
  }

  return pageSections.map((section) => {
    const home = homeByGroup.get(section.group);
    if (!home) return section;
    if (
      section.id === home.id &&
      section.variant === home.variant &&
      section.defaultVariant === home.defaultVariant
    ) {
      return section;
    }
    return {
      ...section,
      id: home.id,
      variant: home.variant,
      defaultVariant: home.defaultVariant,
    };
  });
}
