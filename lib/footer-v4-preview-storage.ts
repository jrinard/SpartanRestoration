import {
  getCommittedHomepagePreviewSettings,
  shouldUsePlaygroundPreviewSettings,
} from "@/lib/homepage-settings";
import {
  defaultFooterV4PreviewSettings,
  mergeFooterV4GlobalContent,
  normalizeFooterV4PreviewSettings,
  pickFooterV4ContentOverrides,
  type FooterV4ContentOverrides,
  type FooterV4PreviewSettings,
} from "@/lib/footer-v4-preview";

export type { FooterV4PreviewSettings };
export { normalizeFooterV4PreviewSettings };
import {
  loadAllSectionInstanceSettings,
  saveSectionInstanceField,
} from "@/lib/section-instance-storage";
import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const footerV4PreviewStorageKey = "lifespring-footer-v4-preview";

export function loadFooterV4PreviewSettings(): FooterV4PreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.footerV4;
    if (committed) return normalizeFooterV4PreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultFooterV4PreviewSettings;
  }

  try {
    const stored = orgStorageGet(footerV4PreviewStorageKey);
    if (!stored) return defaultFooterV4PreviewSettings;
    const parsed: unknown = JSON.parse(stored);
    if (parsed && typeof parsed === "object") {
      return normalizeFooterV4PreviewSettings(parsed as Partial<FooterV4PreviewSettings>);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultFooterV4PreviewSettings;
}

export function saveFooterV4PreviewSettings(settings: FooterV4PreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(footerV4PreviewStorageKey, JSON.stringify(normalizeFooterV4PreviewSettings(settings)));
}

export function saveFooterV4ContentOverrides(patch: FooterV4ContentOverrides): void {
  if (typeof window === "undefined") return;

  const global = normalizeFooterV4PreviewSettings({
    ...loadFooterV4PreviewSettings(),
    ...patch,
  });
  saveFooterV4PreviewSettings(global);

  const instances = loadAllSectionInstanceSettings();
  for (const [instanceId, settings] of Object.entries(instances)) {
    if (!settings.footerV4) continue;
    saveSectionInstanceField(
      instanceId,
      "footerV4",
      normalizeFooterV4PreviewSettings({ ...settings.footerV4, ...patch }),
    );
  }
}

export function resolveFooterV4PreviewSettings(
  instance?: FooterV4PreviewSettings,
  global?: FooterV4PreviewSettings,
): FooterV4PreviewSettings | undefined {
  if (!instance && !global) return undefined;
  if (!instance) return global ? normalizeFooterV4PreviewSettings(global) : undefined;
  if (!global) return normalizeFooterV4PreviewSettings(instance);
  return normalizeFooterV4PreviewSettings(mergeFooterV4GlobalContent(instance, global));
}
