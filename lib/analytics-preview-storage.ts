import {
  defaultAnalyticsPreviewSettings,
  normalizeAnalyticsPreviewSettings,
  type AnalyticsPreviewSettings,
} from "@/lib/analytics-preview";
import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";

export const analyticsPreviewStorageKey = "lifespring-analytics-preview";

function parseStoredAnalyticsPreview(raw: string): AnalyticsPreviewSettings | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return normalizeAnalyticsPreviewSettings(parsed as Partial<AnalyticsPreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return null;
}

export function loadAnalyticsPreviewSettings(): AnalyticsPreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.analytics;
    if (committed) return normalizeAnalyticsPreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultAnalyticsPreviewSettings;
  }

  const stored = localStorage.getItem(analyticsPreviewStorageKey);
  if (stored) {
    const parsed = parseStoredAnalyticsPreview(stored);
    if (parsed) return parsed;
  }

  const committed = getCommittedHomepagePreviewSettings()?.analytics;
  if (committed) return normalizeAnalyticsPreviewSettings(committed);

  return defaultAnalyticsPreviewSettings;
}

export function saveAnalyticsPreviewSettings(settings: AnalyticsPreviewSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    analyticsPreviewStorageKey,
    JSON.stringify(normalizeAnalyticsPreviewSettings(settings)),
  );
}
