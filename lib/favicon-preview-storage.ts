import {
  defaultFaviconPreviewSettings,
  normalizeFaviconPreviewSettings,
  type FaviconPreviewSettings,
} from "@/lib/favicon-preview";
import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const faviconPreviewStorageKey = "lifespring-favicon-preview";

function parseStoredFaviconPreview(raw: string): FaviconPreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeFaviconPreviewSettings(parsed as Partial<FaviconPreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadFaviconPreviewSettings(): FaviconPreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.favicon;
    if (committed) return normalizeFaviconPreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultFaviconPreviewSettings;
  }

  const stored = orgStorageGet(faviconPreviewStorageKey);
  if (stored) {
    const parsed = parseStoredFaviconPreview(stored);
    if (parsed) return parsed;
  }

  const committed = getCommittedHomepagePreviewSettings()?.favicon;
  if (committed) return normalizeFaviconPreviewSettings(committed);

  return defaultFaviconPreviewSettings;
}

export function saveFaviconPreviewSettings(settings: FaviconPreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(
    faviconPreviewStorageKey,
    JSON.stringify(normalizeFaviconPreviewSettings(settings)),
  );
}
