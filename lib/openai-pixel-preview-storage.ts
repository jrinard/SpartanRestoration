import {
  defaultOpenAiPixelPreviewSettings,
  normalizeOpenAiPixelPreviewSettings,
  type OpenAiPixelPreviewSettings,
} from "@/lib/openai-pixel-preview";
import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const openAiPixelPreviewStorageKey = "lifespring-openai-pixel-preview";

function parseStored(raw: string): OpenAiPixelPreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeOpenAiPixelPreviewSettings(parsed as Partial<OpenAiPixelPreviewSettings>);
    }
  } catch {
    // ignore
  }
  return null;
}

export function loadOpenAiPixelPreviewSettings(): OpenAiPixelPreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.openaiPixel;
    if (committed) return normalizeOpenAiPixelPreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultOpenAiPixelPreviewSettings;
  }

  const stored = orgStorageGet(openAiPixelPreviewStorageKey);
  if (stored) {
    const parsed = parseStored(stored);
    if (parsed) return parsed;
  }

  const committed = getCommittedHomepagePreviewSettings()?.openaiPixel;
  if (committed) return normalizeOpenAiPixelPreviewSettings(committed);

  return defaultOpenAiPixelPreviewSettings;
}

export function saveOpenAiPixelPreviewSettings(settings: OpenAiPixelPreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(
    openAiPixelPreviewStorageKey,
    JSON.stringify(normalizeOpenAiPixelPreviewSettings(settings)),
  );
}
