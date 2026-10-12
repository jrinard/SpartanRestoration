import { getCommittedHomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  defaultFlipCardsPreviewSettings,
  normalizeFlipCardsPreviewSettings,
  type FlipCardsPreviewSettings,
} from "@/lib/flip-cards-preview";
import bundledFlipCardsPresetLibrary from "@/lib/flip-cards-preset-library.json";
import { getClientOrgId, orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export type { FlipCardsPreviewSettings };

export const flipCardsPreviewStorageKey = "lifespring-flip-cards-preview";

export { normalizeFlipCardsPreviewSettings };

function orgDefaultFlipCardsSettings(): FlipCardsPreviewSettings {
  const orgId = getClientOrgId();
  const presetId =
    orgId === "professional-turf-landscape" ? "professional-turf-landscape" : "ospressure";
  const entry = bundledFlipCardsPresetLibrary.entries.find((item) => item.id === presetId);
  const settings = entry?.settings ?? bundledFlipCardsPresetLibrary.entries[0]?.settings;
  return normalizeFlipCardsPreviewSettings(
    (settings ?? {}) as Partial<FlipCardsPreviewSettings>,
  );
}

export function loadFlipCardsPreviewSettings(): FlipCardsPreviewSettings {
  const orgDefault = orgDefaultFlipCardsSettings;

  const committed = getCommittedHomepagePreviewSettings()?.flipCards;
  if (committed) return normalizeFlipCardsPreviewSettings(committed);

  if (typeof window === "undefined") return defaultFlipCardsPreviewSettings;

  try {
    const stored = orgStorageGet(flipCardsPreviewStorageKey);
    if (!stored) return orgDefault();
    return normalizeFlipCardsPreviewSettings(JSON.parse(stored) as Partial<FlipCardsPreviewSettings>);
  } catch {
    return orgDefault();
  }
}

export function saveFlipCardsPreviewSettings(settings: FlipCardsPreviewSettings): void {
  orgStorageSet(
    flipCardsPreviewStorageKey,
    JSON.stringify(normalizeFlipCardsPreviewSettings(settings)),
  );
}
