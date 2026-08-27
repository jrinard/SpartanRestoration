import { normalizeGoogleSiteVerificationFile } from "@/lib/google-site-verification";
export type AnalyticsPreviewSettings = {
  enabled: boolean;
  measurementId: string;
  /** Search Console HTML filename at the site root, e.g. googleabc123.html */
  siteVerificationFile?: string;
};

export const gaMeasurementIdPlaceholder = "G-XXXXXXXXXX";

export const defaultAnalyticsPreviewSettings: AnalyticsPreviewSettings = {
  enabled: false,
  measurementId: "",
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
    typeof value.measurementId === "string"
      ? normalizeGaMeasurementId(value.measurementId)
      : defaultAnalyticsPreviewSettings.measurementId;
  const siteVerificationFile = normalizeGoogleSiteVerificationFile(value.siteVerificationFile);

  return {
    enabled: value.enabled === true,
    measurementId,
    ...(siteVerificationFile ? { siteVerificationFile } : {}),
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
