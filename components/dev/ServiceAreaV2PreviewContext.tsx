"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getServiceAreaV2ThemeDefaults,
  type ServiceAreaV2BackgroundMode,
  type ServiceAreaV2PreviewSettings,
  type ServiceAreaV2SectionTheme,
} from "@/lib/service-area-v2-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import { previewGradientDirections } from "@/lib/preview-gradient";
import {
  loadServiceAreaV2PreviewSettings,
  normalizeServiceAreaV2PreviewSettings,
  saveServiceAreaV2PreviewSettings,
} from "@/lib/service-area-v2-preview-storage";
import {
  applyServiceAreaV2Preset,
  bundledServiceAreaV2Presets,
  defaultServiceAreaV2PresetId,
  isServiceAreaV2PresetId,
  listServiceAreaV2Presets,
  normalizeServiceAreaV2PresetLibrary,
  type ServiceAreaV2PresetId,
  type ServiceAreaV2PresetLibrary,
} from "@/lib/service-area-v2-presets";
import { useOptionalOrg } from "@/components/dev/OrgProvider";

type ServiceAreaV2PreviewContextValue = {
  settings: ServiceAreaV2PreviewSettings;
  setSettings: (settings: ServiceAreaV2PreviewSettings) => void;
  contentEditingEnabled: boolean;
  setEyebrow: (value: string) => void;
  setHeading: (value: string) => void;
  setIntro: (value: string) => void;
};

const ServiceAreaV2PreviewContext = createContext<ServiceAreaV2PreviewContextValue | null>(null);

export function ServiceAreaV2PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ServiceAreaV2PreviewSettings;
  enableContentEditing?: boolean;
}) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "serviceAreaV2",
    initialSettings,
    defaultSettings: applyServiceAreaV2Preset(defaultServiceAreaV2PresetId),
    loadGlobal: loadServiceAreaV2PreviewSettings,
    saveGlobal: saveServiceAreaV2PreviewSettings,
    normalize: normalizeServiceAreaV2PreviewSettings,
  });

  const setSettings = useCallback(
    (next: ServiceAreaV2PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const setEyebrow = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      setSettings(normalizeServiceAreaV2PreviewSettings({ ...settings, eyebrow: trimmed }));
    },
    [enableContentEditing, settings, setSettings],
  );

  const setHeading = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      setSettings(normalizeServiceAreaV2PreviewSettings({ ...settings, heading: trimmed }));
    },
    [enableContentEditing, settings, setSettings],
  );

  const setIntro = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      setSettings(normalizeServiceAreaV2PreviewSettings({ ...settings, intro: trimmed }));
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <ServiceAreaV2PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        setEyebrow,
        setHeading,
        setIntro,
      }}
    >
      {children}
    </ServiceAreaV2PreviewContext.Provider>
  );
}

export function useServiceAreaV2Preview() {
  return useContext(ServiceAreaV2PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

function applyLibraryPayload(library: unknown): ServiceAreaV2PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeServiceAreaV2PresetLibrary(library);
}

export function ServiceAreaV2PreviewControls() {
  const context = useServiceAreaV2Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<ServiceAreaV2PresetId | "">("");
  const [library, setLibrary] = useState(bundledServiceAreaV2Presets);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/service-area-v2-presets")
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
  const presets = listServiceAreaV2Presets(library);

  async function savePreset() {
    setSaveState("saving");
    try {
      const defaultId = org?.orgId === "spartan" ? "spartan" : "lifespring";
      const response = await fetch("/api/service-area-v2-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: defaultId, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isServiceAreaV2PresetId(data.id)) {
        setPresetId(data.id);
      }
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1600);
    } catch {
      setSaveState("error");
    }
  }

  const update = (patch: Partial<ServiceAreaV2PreviewSettings>) => {
    setSettings(normalizeServiceAreaV2PreviewSettings({ ...settings, ...patch }));
  };

  const applyTheme = (theme: ServiceAreaV2SectionTheme) => {
    const themeDefaults = getServiceAreaV2ThemeDefaults(theme);
    update({
      theme,
      solidBackground: themeDefaults.solidBackground,
      cardBackgroundColor: themeDefaults.cardBackgroundColor,
      cardHoverBackgroundColor: themeDefaults.cardHoverBackgroundColor,
      cardTextColor: themeDefaults.cardTextColor,
      cardMutedColor: themeDefaults.cardMutedColor,
      linkColor: themeDefaults.linkColor,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Preset</span>
        <select
          value={presetId}
          onChange={(event) => {
            const nextId = event.target.value;
            if (!isServiceAreaV2PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            setSettings(applyServiceAreaV2Preset(nextId, library));
          }}
          className={buttonClassName}
          aria-label="Apply service area section preset"
        >
          <option value="">Custom</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => void savePreset()}
        disabled={saveState === "saving"}
        className={buttonClassName}
        aria-label="Save current styling to org preset"
      >
        {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save preset"}
      </button>

      <span className="font-mono text-xs text-accent-purple/80">Theme</span>
      {(["light", "dark"] as const).map((theme) => (
        <button
          key={theme}
          type="button"
          className={buttonClassName}
          data-active={settings.theme === theme ? "true" : undefined}
          onClick={() => applyTheme(theme)}
        >
          {theme}
        </button>
      ))}

      <span className="font-mono text-xs text-accent-purple/80">Width</span>
      <select
        value={settings.layoutWidth}
        onChange={(event) => update({ layoutWidth: event.target.value as typeof settings.layoutWidth })}
        className={buttonClassName}
      >
        {siteLayoutWidthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="font-mono text-xs text-accent-purple/80">BG</span>
      <select
        value={settings.backgroundMode}
        onChange={(event) =>
          update({ backgroundMode: event.target.value as ServiceAreaV2BackgroundMode })
        }
        className={buttonClassName}
      >
        <option value="solid">Solid</option>
        <option value="gradient">Gradient</option>
      </select>

      <input
        type="color"
        value={settings.solidBackground}
        onChange={(event) => update({ solidBackground: event.target.value })}
        aria-label="Section background"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Accent</span>
      <input
        type="color"
        value={settings.accentColor}
        onChange={(event) => update({ accentColor: event.target.value })}
        aria-label="Accent color"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Link</span>
      <input
        type="color"
        value={settings.linkColor}
        onChange={(event) => update({ linkColor: event.target.value })}
        aria-label="Link color"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Card</span>
      <input
        type="color"
        value={settings.cardBackgroundColor}
        onChange={(event) => update({ cardBackgroundColor: event.target.value })}
        aria-label="Card background"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Card radius</span>
      <input
        type="range"
        min={0}
        max={48}
        step={4}
        value={settings.cardBorderRadiusPx}
        onChange={(event) => update({ cardBorderRadiusPx: Number(event.target.value) })}
        aria-label="Card border radius"
        className="h-1.5 w-20 cursor-pointer accent-accent-purple"
      />

      {settings.backgroundMode === "gradient" ? (
        <>
          <input
            type="color"
            value={settings.background.from}
            onChange={(event) =>
              update({ background: { ...settings.background, from: event.target.value } })
            }
            aria-label="Gradient from"
            className={colorInputClassName}
          />
          <input
            type="color"
            value={settings.background.to}
            onChange={(event) =>
              update({ background: { ...settings.background, to: event.target.value } })
            }
            aria-label="Gradient to"
            className={colorInputClassName}
          />
          <select
            value={settings.background.direction}
            onChange={(event) =>
              update({
                background: {
                  ...settings.background,
                  direction: event.target.value as typeof settings.background.direction,
                },
              })
            }
            className={buttonClassName}
          >
            {previewGradientDirections.map((direction) => (
              <option key={direction.value} value={direction.value}>
                {direction.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
    </div>
  );
}
