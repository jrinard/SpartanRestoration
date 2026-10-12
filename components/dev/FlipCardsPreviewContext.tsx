"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import { updateFlipCardsCard } from "@/lib/flip-cards-cards";
import type { FlipCardsPreviewCard, FlipCardsPreviewSettings } from "@/lib/flip-cards-preview";
import {
  applyFlipCardsPreset,
  bundledFlipCardsPresets,
  defaultFlipCardsPresetIdForOrg,
  isFlipCardsPresetId,
  listFlipCardsPresets,
  normalizeFlipCardsPresetLibrary,
  type FlipCardsPresetId,
  type FlipCardsPresetLibrary,
  defaultFlipCardsPreviewSettingsForLayout,
} from "@/lib/flip-cards-presets";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { getClientOrgId } from "@/lib/org/browser-storage";
import {
  loadFlipCardsPreviewSettings,
  normalizeFlipCardsPreviewSettings,
  saveFlipCardsPreviewSettings,
} from "@/lib/flip-cards-preview-storage";

type FlipCardsPreviewContextValue = {
  settings: FlipCardsPreviewSettings;
  setSettings: (settings: FlipCardsPreviewSettings) => void;
  contentEditingEnabled: boolean;
  layout: "three" | "four";
  updateCard: (cardId: string, patch: Partial<FlipCardsPreviewCard>) => void;
};

const FlipCardsPreviewContext = createContext<FlipCardsPreviewContextValue | null>(null);

type FlipCardsPreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: FlipCardsPreviewSettings;
  layout?: "three" | "four";
  enableContentEditing?: boolean;
};

export function FlipCardsPreviewProvider({
  children,
  instanceId,
  initialSettings,
  layout = "three",
  enableContentEditing = false,
}: FlipCardsPreviewProviderProps) {
  const org = useOptionalOrg();
  const orgId = org?.orgId ?? getClientOrgId();

  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "flipCards",
    initialSettings,
    defaultSettings: defaultFlipCardsPreviewSettingsForLayout(orgId, layout),
    loadGlobal: loadFlipCardsPreviewSettings,
    saveGlobal: saveFlipCardsPreviewSettings,
    normalize: normalizeFlipCardsPreviewSettings,
  });

  const updateCard = useCallback(
    (cardId: string, patch: Partial<FlipCardsPreviewCard>) => {
      setSettings({
        ...settings,
        cards: updateFlipCardsCard(settings.cards, cardId, patch),
      });
    },
    [setSettings, settings],
  );

  return (
    <FlipCardsPreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        layout,
        updateCard,
      }}
    >
      {children}
    </FlipCardsPreviewContext.Provider>
  );
}

export function useFlipCardsPreview() {
  return useContext(FlipCardsPreviewContext);
}

const checkboxClassName = "h-4 w-4 accent-accent-purple";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

function applyLibraryPayload(library: unknown): FlipCardsPresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeFlipCardsPresetLibrary(library);
}

export function FlipCardsPreviewControls() {
  const context = useFlipCardsPreview();
  const org = useOptionalOrg();
  const orgId = org?.orgId ?? getClientOrgId();
  const [presetId, setPresetId] = useState<FlipCardsPresetId | "">("");
  const [library, setLibrary] = useState(bundledFlipCardsPresets);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/flip-cards-presets")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { library?: unknown } | null) => {
        if (cancelled || !data?.library) return;
        const next = applyLibraryPayload(data.library);
        if (next) setLibrary(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!context) return null;

  const { settings, setSettings } = context;
  const presets = listFlipCardsPresets(library);
  const orgDefaultId = defaultFlipCardsPresetIdForOrg(orgId);

  return (
    <>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Preset</span>
        <select
          value={presetId}
          onChange={(event) => {
            const nextId = event.target.value;
            if (!isFlipCardsPresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            setSettings(applyFlipCardsPreset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply flip cards starter"
        >
          <option value="">Custom</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
              {preset.id === orgDefaultId ? " (org default)" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          className={checkboxClassName}
          checked={settings.showTornDivider}
          onChange={(event) =>
            setSettings({ ...settings, showTornDivider: event.target.checked })
          }
          aria-label="Show wavy bottom divider"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Wavy bottom
        </span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Section BG</span>
        <input
          type="color"
          value={settings.sectionBackground ?? "#111111"}
          onChange={(event) =>
            setSettings({ ...settings, sectionBackground: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Flip cards section background color"
        />
        {settings.sectionBackground ? (
          <button
            type="button"
            className={buttonClassName}
            onClick={() => setSettings({ ...settings, sectionBackground: undefined })}
          >
            Page
          </button>
        ) : null}
      </label>
    </>
  );
}
