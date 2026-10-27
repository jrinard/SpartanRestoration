import { isForgePrefix } from "@/lib/forge";
import {
  isLocalAnalyticsHostname,
  shouldInjectGoogleAnalytics,
} from "@/lib/analytics-preview";
import { normalizeSiteDomain } from "@/lib/site-url";

export type OpenAiPixelPreviewSettings = {
  enabled: boolean;
  pixelId: string;
};

export const openAiPixelIdPlaceholder = "1ZC5MpXoEZXc1LVwoS1oCR";

export const defaultOpenAiPixelPreviewSettings: OpenAiPixelPreviewSettings = {
  enabled: false,
  pixelId: "",
};

/** Standard + custom events implemented in code (for Org Settings reference). */
export const OPENAI_PIXEL_IMPLEMENTED_EVENTS = [
  {
    name: "page_viewed",
    kind: "standard",
    note: "type: contents — every page load and client route change",
  },
  {
    name: "lead_created",
    kind: "standard",
    note: "type: customer_action — contact form API success only",
  },
  {
    name: "cta_clicked",
    kind: "custom",
    note: "tel: links or any element with data-openai-pixel-cta",
  },
] as const;

export const OPENAI_PIXEL_SDK_URL = "https://bzrcdn.openai.com/sdk/oaiq.min.js";

export const OPENAI_PIXEL_CUSTOM_CTA_EVENT = "cta_clicked";

/** Add to any button or link to fire the cta_clicked pixel event (in addition to tel: links). */
export const OPENAI_PIXEL_CTA_ATTR = "data-openai-pixel-cta";

export function normalizeOpenAiPixelId(value: string): string {
  return value.trim();
}

/** OpenAI pixel IDs are alphanumeric strings from Ads Manager. */
export function isValidOpenAiPixelId(value: string): boolean {
  const id = normalizeOpenAiPixelId(value);
  return /^[A-Za-z0-9]{10,64}$/.test(id);
}

export function normalizeOpenAiPixelPreviewSettings(
  value: Partial<OpenAiPixelPreviewSettings> | null | undefined,
): OpenAiPixelPreviewSettings {
  if (!value || typeof value !== "object") {
    return { ...defaultOpenAiPixelPreviewSettings };
  }

  return {
    enabled: value.enabled === true,
    pixelId:
      typeof value.pixelId === "string"
        ? normalizeOpenAiPixelId(value.pixelId)
        : defaultOpenAiPixelPreviewSettings.pixelId,
  };
}

export function getActiveOpenAiPixelId(
  settings: OpenAiPixelPreviewSettings | null | undefined,
): string | null {
  const normalized = normalizeOpenAiPixelPreviewSettings(settings ?? undefined);
  if (!normalized.enabled) return null;
  if (!isValidOpenAiPixelId(normalized.pixelId)) return null;
  return normalized.pixelId;
}

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

export function hostnameMatchesOrgDomain(
  hostname: string | null | undefined,
  orgDomain: string | null | undefined,
): boolean {
  if (!hostname || !orgDomain?.trim()) return true;
  return normalizeHostname(hostname) === normalizeHostname(normalizeSiteDomain(orgDomain));
}

/** Vision production, matching org domain, not Forge/localhost. */
export function shouldInjectOpenAiPixel(options: {
  allowTracking: boolean;
  pathname?: string | null;
  hostname?: string | null;
  orgDomain?: string | null;
}): boolean {
  if (
    !shouldInjectGoogleAnalytics({
      allowTracking: options.allowTracking,
      pathname: options.pathname,
      hostname: options.hostname,
    })
  ) {
    return false;
  }
  if (isForgePrefix(options.pathname)) return false;
  if (isLocalAnalyticsHostname(options.hostname)) return false;
  return hostnameMatchesOrgDomain(options.hostname, options.orgDomain);
}

export const openAiPixelPreviewUpdatedEvent = "lifespring-openai-pixel-preview-updated";

export function notifyOpenAiPixelPreviewUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(openAiPixelPreviewUpdatedEvent));
}

export type OpenAiPixelRuntimeMode = "off" | "live" | "fake";

/** Live on Vision production domain; fake on localhost when pixel is enabled for the org. */
export function resolveOpenAiPixelRuntimeMode(options: {
  allowTracking: boolean;
  pathname?: string | null;
  hostname?: string | null;
  orgDomain?: string | null;
  settings?: OpenAiPixelPreviewSettings | null;
}): { mode: OpenAiPixelRuntimeMode; pixelId: string | null } {
  const pixelId = getActiveOpenAiPixelId(options.settings ?? undefined);
  if (!pixelId) {
    return { mode: "off", pixelId: null };
  }

  if (
    shouldInjectOpenAiPixel({
      allowTracking: options.allowTracking,
      pathname: options.pathname,
      hostname: options.hostname,
      orgDomain: options.orgDomain,
    })
  ) {
    return { mode: "live", pixelId };
  }

  if (isLocalAnalyticsHostname(options.hostname)) {
    return { mode: "fake", pixelId };
  }

  return { mode: "off", pixelId: null };
}
