/** Google Analytics (gtag.js) settings — saved with homepage publish. */
export type AnalyticsPreviewSettings = {
  enabled: boolean;
  measurementId: string;
};

export const defaultSpartanGaMeasurementId = "G-CB0501GNVZ";

export const defaultAnalyticsPreviewSettings: AnalyticsPreviewSettings = {
  enabled: true,
  measurementId: defaultSpartanGaMeasurementId,
};

export function normalizeGaMeasurementId(value: string): string {
  return value.trim().toUpperCase();
}

/** GA4 measurement IDs look like G-XXXXXXXXXX */
export function isValidGaMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]+$/.test(normalizeGaMeasurementId(value));
}

export function normalizeAnalyticsPreviewSettings(
  value: Partial<AnalyticsPreviewSettings> | null | undefined,
): AnalyticsPreviewSettings {
  if (!value || typeof value !== "object") {
    return { ...defaultAnalyticsPreviewSettings };
  }

  const measurementId =
    typeof value.measurementId === "string" && value.measurementId.trim()
      ? normalizeGaMeasurementId(value.measurementId)
      : defaultAnalyticsPreviewSettings.measurementId;

  return {
    enabled: value.enabled !== false,
    measurementId,
  };
}

export function getActiveGaMeasurementId(
  settings: AnalyticsPreviewSettings | null | undefined,
): string | null {
  const normalized = normalizeAnalyticsPreviewSettings(settings ?? undefined);
  if (!normalized.enabled) return null;
  if (!isValidGaMeasurementId(normalized.measurementId)) return null;
  return normalized.measurementId;
}

export const analyticsPreviewUpdatedEvent = "lifespring-analytics-preview-updated";

export function notifyAnalyticsPreviewUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(analyticsPreviewUpdatedEvent));
}
