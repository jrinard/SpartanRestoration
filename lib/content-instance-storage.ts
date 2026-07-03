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

export type ContentInstanceSettings = {
  textIconsV3?: TextIconsV3PreviewSettings;
  textImage?: TextImagePreviewSettings;
};

export const contentInstancesStorageKey = "lifespring-content-instances";

function readJson<T>(raw: string | null): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function readAllContentInstances(): Record<string, ContentInstanceSettings> {
  if (typeof window === "undefined") return {};
  return (
    readJson<Record<string, ContentInstanceSettings>>(
      localStorage.getItem(contentInstancesStorageKey),
    ) ?? {}
  );
}

function writeAllContentInstances(instances: Record<string, ContentInstanceSettings>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(contentInstancesStorageKey, JSON.stringify(instances));
}

export function loadContentInstanceSettings(
  instanceId: string,
): ContentInstanceSettings | undefined {
  return readAllContentInstances()[instanceId];
}

export function saveContentInstanceSettings(
  instanceId: string,
  settings: ContentInstanceSettings,
): void {
  const instances = readAllContentInstances();
  instances[instanceId] = settings;
  writeAllContentInstances(instances);
}

export function loadAllContentInstanceSettings(): Record<string, ContentInstanceSettings> {
  return readAllContentInstances();
}

export function loadTextIconsV3InstanceSettings(
  instanceId: string,
): TextIconsV3PreviewSettings | undefined {
  const instance = loadContentInstanceSettings(instanceId);
  return instance?.textIconsV3
    ? normalizeTextIconsV3PreviewSettings(instance.textIconsV3)
    : undefined;
}

export function saveTextIconsV3InstanceSettings(
  instanceId: string,
  settings: TextIconsV3PreviewSettings,
): void {
  const current = loadContentInstanceSettings(instanceId) ?? {};
  saveContentInstanceSettings(instanceId, {
    ...current,
    textIconsV3: normalizeTextIconsV3PreviewSettings(settings),
  });
}

export function loadTextImageInstanceSettings(
  instanceId: string,
): TextImagePreviewSettings | undefined {
  const instance = loadContentInstanceSettings(instanceId);
  return instance?.textImage
    ? normalizeTextImagePreviewSettings(instance.textImage)
    : undefined;
}

export function saveTextImageInstanceSettings(
  instanceId: string,
  settings: TextImagePreviewSettings,
): void {
  const current = loadContentInstanceSettings(instanceId) ?? {};
  saveContentInstanceSettings(instanceId, {
    ...current,
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
): void {
  const current = loadContentInstanceSettings(toId) ?? {};
  const variant = sourceVariant ?? "text-icons-v3";

  if (variant === "text-image-v1") {
    saveContentInstanceSettings(toId, {
      ...current,
      textImage: structuredClone(loadEffectiveTextImageInstanceSettings(fromId)),
    });
    return;
  }

  if (variant === "text-icons-v3") {
    saveContentInstanceSettings(toId, {
      ...current,
      textIconsV3: structuredClone(loadEffectiveTextIconsV3InstanceSettings(fromId)),
    });
    return;
  }

  const from = loadContentInstanceSettings(fromId);
  if (from) {
    saveContentInstanceSettings(toId, structuredClone(from));
    return;
  }

  saveContentInstanceSettings(toId, {
    textIconsV3: loadTextIconsV3PreviewSettings(),
    textImage: loadTextImagePreviewSettings(),
  });
}
