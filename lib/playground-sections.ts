import type { SectionGroupId } from "@/lib/section-registry";
import { sectionGroups } from "@/lib/section-registry";
import { createPlaygroundSectionId } from "@/lib/playground-section-id";

export type PlaygroundSectionConfig = {
  /** Unique slot id — required for duplicate spacers in the layout. */
  id: string;
  group: SectionGroupId;
  defaultVariant?: string;
  /** Selected variant in playground (persisted for /preview). */
  variant?: string;
  /** When true, section appears on /preview. */
  preview?: boolean;
  /** When true, section is hidden from the playground builder UI. */
  hidden?: boolean;
};

export const playgroundSectionOrderKey = "lifespring-playground-section-order";

const duplicatableSectionGroups = new Set<SectionGroupId>(["spacer", "content"]);

export function canDuplicatePlaygroundSection(group: SectionGroupId): boolean {
  return duplicatableSectionGroups.has(group);
}

const LEGACY_SECTION_GROUP_ALIASES: Partial<Record<string, SectionGroupId>> = {
  flipCards: "content",
};

const defaultSectionDefs: Omit<PlaygroundSectionConfig, "id">[] = [
  { group: "topBar", defaultVariant: "top-bar-v1", preview: false },
  { group: "header", defaultVariant: "header-v3", preview: false },
  { group: "nav", defaultVariant: "nav-v1", preview: false },
  { group: "hero", defaultVariant: "heroWashing-v1", preview: false },
  { group: "spacer", defaultVariant: "spacer-v1", preview: false },
  { group: "content", defaultVariant: "text-icons-v3", preview: false },
  { group: "services", defaultVariant: "services-v1", preview: false },
  { group: "reviewbox", defaultVariant: "reviewbox-v1", preview: false },
  { group: "portfolio", preview: false },
  { group: "testimonials", defaultVariant: "testimonials-v3", preview: false },
  { group: "cta", preview: false },
  { group: "contact", defaultVariant: "contact-v1", preview: false },
  { group: "footer", defaultVariant: "footer-v4", preview: false },
];

export const defaultPlaygroundSections: PlaygroundSectionConfig[] = defaultSectionDefs.map(
  (section) => ({
    ...section,
    id: createPlaygroundSectionId(section.group),
  }),
);

const knownGroups = new Set(defaultSectionDefs.map((section) => section.group));

export function getPlaygroundSectionVariant(config: PlaygroundSectionConfig): string | undefined {
  return config.variant ?? config.defaultVariant;
}

export function getPreviewSections(sections: PlaygroundSectionConfig[]): PlaygroundSectionConfig[] {
  return sections.filter((section) => section.preview === true);
}

export function getVisiblePlaygroundSections(
  sections: PlaygroundSectionConfig[],
): PlaygroundSectionConfig[] {
  return sections.filter((section) => section.hidden !== true);
}

export function getPlaygroundSectionLabel(
  sections: PlaygroundSectionConfig[],
  config: PlaygroundSectionConfig,
): string {
  if (config.group === "spacer" || config.group === "content") {
    const sectionIndex = sections.findIndex((section) => section.id === config.id);
    const groupIndex = sections
      .slice(0, sectionIndex + 1)
      .filter((section) => section.group === config.group).length;
    return `${sectionGroups[config.group].label} ${groupIndex}`;
  }

  return sectionGroups[config.group].label;
}

export function reorderVisiblePlaygroundSections(
  sections: PlaygroundSectionConfig[],
  fromId: string,
  toId: string,
): PlaygroundSectionConfig[] {
  if (fromId === toId) return sections;

  const visible = getVisiblePlaygroundSections(sections);
  const fromIndex = visible.findIndex((section) => section.id === fromId);
  const toIndex = visible.findIndex((section) => section.id === toId);
  if (fromIndex === -1 || toIndex === -1) return sections;

  const reorderedVisible = [...visible];
  const [moved] = reorderedVisible.splice(fromIndex, 1);
  reorderedVisible.splice(toIndex, 0, moved);

  let visibleIndex = 0;
  return sections.map((section) => {
    if (section.hidden) return section;
    return reorderedVisible[visibleIndex++] ?? section;
  });
}

function fallbackForGroup(group: SectionGroupId): PlaygroundSectionConfig | undefined {
  return defaultPlaygroundSections.find((section) => section.group === group);
}

function normalizeStoredSection(item: unknown): PlaygroundSectionConfig | null {
  if (!item || typeof item !== "object" || !("group" in item) || typeof item.group !== "string") {
    return null;
  }

  const groupRaw = item.group as string;
  const group = (LEGACY_SECTION_GROUP_ALIASES[groupRaw] ?? groupRaw) as SectionGroupId;
  if (!knownGroups.has(group)) return null;

  const fallback = fallbackForGroup(group);
  const record = item as Partial<PlaygroundSectionConfig>;

  return {
    id: typeof record.id === "string" && record.id ? record.id : createPlaygroundSectionId(group),
    group,
    defaultVariant:
      typeof record.defaultVariant === "string"
        ? record.defaultVariant
        : fallback?.defaultVariant,
    variant: typeof record.variant === "string" ? record.variant : undefined,
    preview:
      typeof record.preview === "boolean" ? record.preview : fallback?.preview ?? false,
    hidden: typeof record.hidden === "boolean" ? record.hidden : false,
  };
}

export function mergePlaygroundSectionOrder(stored: unknown): PlaygroundSectionConfig[] {
  return parsePlaygroundSectionOrder(stored, { mergeMissingDefaults: true });
}

export function parsePlaygroundSectionOrder(
  stored: unknown,
  options?: { mergeMissingDefaults?: boolean },
): PlaygroundSectionConfig[] {
  const mergeMissingDefaults = options?.mergeMissingDefaults ?? true;

  if (!Array.isArray(stored) || stored.length === 0) {
    return mergeMissingDefaults ? defaultPlaygroundSections : [];
  }

  const merged: PlaygroundSectionConfig[] = [];
  const seenNonSpacerGroups = new Set<SectionGroupId>();

  for (const item of stored) {
    const section = normalizeStoredSection(item);
    if (!section) continue;

    if (!canDuplicatePlaygroundSection(section.group)) {
      if (seenNonSpacerGroups.has(section.group)) continue;
      seenNonSpacerGroups.add(section.group);
    }

    merged.push(section);
  }

  if (!mergeMissingDefaults) {
    return merged;
  }

  for (const fallback of defaultPlaygroundSections) {
    if (canDuplicatePlaygroundSection(fallback.group)) continue;
    if (!seenNonSpacerGroups.has(fallback.group)) {
      if (fallback.group === "topBar") {
        merged.unshift({ ...fallback, id: createPlaygroundSectionId(fallback.group) });
      } else if (fallback.group === "nav") {
        const headerIndex = merged.findIndex((section) => section.group === "header");
        const navSection = { ...fallback, id: createPlaygroundSectionId(fallback.group) };
        if (headerIndex !== -1) {
          merged.splice(headerIndex + 1, 0, navSection);
        } else {
          merged.push(navSection);
        }
      } else {
        merged.push({ ...fallback, id: createPlaygroundSectionId(fallback.group) });
      }
      seenNonSpacerGroups.add(fallback.group);
    }
  }

  return merged.length > 0 ? merged : defaultPlaygroundSections;
}

export function duplicatePlaygroundSection(
  sections: PlaygroundSectionConfig[],
  sourceId: string,
): { sections: PlaygroundSectionConfig[]; newId: string } | null {
  const index = sections.findIndex((section) => section.id === sourceId);
  if (index === -1) return null;

  const source = sections[index];
  if (!canDuplicatePlaygroundSection(source.group)) return null;

  const newId = createPlaygroundSectionId(source.group);
  const copy: PlaygroundSectionConfig = {
    ...source,
    id: newId,
  };

  const next = [...sections];
  next.splice(index + 1, 0, copy);
  return { sections: next, newId };
}

/** @deprecated Use duplicatePlaygroundSection */
export function duplicateSpacerSection(
  sections: PlaygroundSectionConfig[],
  sourceId: string,
): { sections: PlaygroundSectionConfig[]; newId: string } | null {
  return duplicatePlaygroundSection(sections, sourceId);
}
