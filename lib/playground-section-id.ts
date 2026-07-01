import type { SectionGroupId } from "@/lib/section-registry";

export function createPlaygroundSectionId(group: SectionGroupId): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${group}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return `${group}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
