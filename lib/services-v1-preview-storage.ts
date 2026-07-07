import {
  defaultServicesV1LayoutWidth,
  type ServicesV1LayoutWidth,
} from "@/lib/services-v1-preview";

export const servicesV1PreviewStorageKey = "lifespring-services-v1-preview";

function isServicesV1LayoutWidth(value: unknown): value is ServicesV1LayoutWidth {
  return value === "contained" || value === "full";
}

function isStoredServicesV1Preview(value: unknown): value is { layoutWidth?: unknown } {
  return Boolean(value && typeof value === "object");
}

import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";

export function loadServicesV1LayoutWidth(): ServicesV1LayoutWidth {
  const committed = getCommittedHomepagePreviewSettings()?.servicesV1LayoutWidth;
  if (committed) return committed;

  if (typeof window === "undefined") {
    return defaultServicesV1LayoutWidth;
  }

  try {
    const stored = localStorage.getItem(servicesV1PreviewStorageKey);
    if (!stored) return defaultServicesV1LayoutWidth;

    const parsed: unknown = JSON.parse(stored);
    if (isStoredServicesV1Preview(parsed) && isServicesV1LayoutWidth(parsed.layoutWidth)) {
      return parsed.layoutWidth;
    }
  } catch {
    // ignore invalid storage
  }

  return defaultServicesV1LayoutWidth;
}

export function saveServicesV1LayoutWidth(layoutWidth: ServicesV1LayoutWidth): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    servicesV1PreviewStorageKey,
    JSON.stringify({ layoutWidth }),
  );
}
