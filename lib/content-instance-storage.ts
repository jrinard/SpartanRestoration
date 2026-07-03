import {
  loadTextIconsV3PreviewSettings,
  normalizeTextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview-storage";
import {
  loadTextImagePreviewSettings,
  normalizeTextImagePreviewSettings,
} from "@/lib/text-image-preview-storage";
import type { TextIconsV3PreviewSettings } from "@/lib/text-icons-v3-preview";
import type { TextImagePreviewSettings } from "@/lib/text-image-preview";
import type { ColorThemeId } from "@/lib/color-themes";
import { copyEffectiveSectionInstanceSettings } from "@/lib/section-instance-copy";
import type { SectionGroupId } from "@/lib/section-registry";
import {
  loadAllSectionInstanceSettings,
  loadSectionInstanceField,
  patchSectionInstanceSettings,
  type SectionInstanceSettings,
} from "@/lib/section-instance-storage";

export type ContentInstanceSettings = Pick<
  SectionInstanceSettings,
  "textIconsV3" | "textImage"
>;

/** @deprecated Use sectionInstancesStorageKey */
export const contentInstancesStorageKey = "lifespring-content-instances";

export function loadContentInstanceSettings(
  instanceId: string,
): ContentInstanceSettings | undefined {
  const textIconsV3 = loadSectionInstanceField(instanceId, "textIconsV3");
  const textImage = loadSectionInstanceField(instanceId, "textImage");

  if (!textIconsV3 && !textImage) return undefined;

  return { textIconsV3, textImage };
}

export function saveContentInstanceSettings(
  instanceId: string,
  settings: ContentInstanceSettings,
): void {
  patchSectionInstanceSettings(instanceId, settings);
}

export function loadAllContentInstanceSettings(): Record<string, ContentInstanceSettings> {
  const all = loadAllSectionInstanceSettings();
  const contents: Record<string, ContentInstanceSettings> = {};

  for (const [id, settings] of Object.entries(all)) {
    if (settings.textIconsV3 || settings.textImage) {
      contents[id] = {
        textIconsV3: settings.textIconsV3,
        textImage: settings.textImage,
      };
    }
  }

  return contents;
}

export function loadTextIconsV3InstanceSettings(
  instanceId: string,
): TextIconsV3PreviewSettings | undefined {
  const stored = loadSectionInstanceField(instanceId, "textIconsV3");
  return stored ? normalizeTextIconsV3PreviewSettings(stored) : undefined;
}

export function saveTextIconsV3InstanceSettings(
  instanceId: string,
  settings: TextIconsV3PreviewSettings,
): void {
  patchSectionInstanceSettings(instanceId, {
    textIconsV3: normalizeTextIconsV3PreviewSettings(settings),
  });
}

export function loadTextImageInstanceSettings(
  instanceId: string,
): TextImagePreviewSettings | undefined {
  const stored = loadSectionInstanceField(instanceId, "textImage");
  return stored ? normalizeTextImagePreviewSettings(stored) : undefined;
}

export function saveTextImageInstanceSettings(
  instanceId: string,
  settings: TextImagePreviewSettings,
): void {
  patchSectionInstanceSettings(instanceId, {
    textImage: normalizeTextImagePreviewSettings(settings),
  });
}

export function copyContentInstanceSettings(fromId: string, toId: string): void {
  copyEffectiveContentInstanceSettings(fromId, toId);
}

export function loadEffectiveTextIconsV3InstanceSettings(
  instanceId: string,
): TextIconsV3PreviewSettings {
  return loadTextIconsV3InstanceSettings(instanceId) ?? loadTextIconsV3PreviewSettings();
}

export function loadEffectiveTextImageInstanceSettings(
  instanceId: string,
): TextImagePreviewSettings {
  return loadTextImageInstanceSettings(instanceId) ?? loadTextImagePreviewSettings();
}

export function copyEffectiveContentInstanceSettings(
  fromId: string,
  toId: string,
  sourceVariant?: string,
  colorThemeId: ColorThemeId = "spartan",
): void {
  const current = loadContentInstanceSettings(toId) ?? {};
  const variant = sourceVariant ?? "text-icons-v3";

  if (variant === "text-image-v1") {
    patchSectionInstanceSettings(toId, {
      ...current,
      textImage: structuredClone(loadEffectiveTextImageInstanceSettings(fromId)),
    });
    return;
  }

  if (variant === "text-icons-v3") {
    patchSectionInstanceSettings(toId, {
      ...current,
      textIconsV3: structuredClone(loadEffectiveTextIconsV3InstanceSettings(fromId)),
    });
    return;
  }

  copyEffectiveSectionInstanceSettings(fromId, toId, "content" as SectionGroupId, variant, colorThemeId);
}
