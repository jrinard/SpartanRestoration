import type { SectionGroupId } from "@/lib/section-registry";

/** Stable id for the default (non-duplicated) slot of a section group. */
export function getDefaultPlaygroundSectionId(group: SectionGroupId): string {
  return `playground-${group}`;
}

export function createPlaygroundSectionId(group: SectionGroupId): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${group}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${group}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
