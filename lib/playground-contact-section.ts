import type { PlaygroundSectionConfig } from "@/lib/playground-sections";
import { findPlaygroundModalSectionId } from "@/lib/playground-modal-sections";

/** Contact modal settings slot on the active playground page. */
export function findPlaygroundContactSectionId(
  sections: readonly PlaygroundSectionConfig[],
): string | undefined {
  return findPlaygroundModalSectionId(sections, "contact");
}
