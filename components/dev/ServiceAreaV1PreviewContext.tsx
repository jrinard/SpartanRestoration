"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import { ServiceAreaV1LocationsControls } from "@/components/dev/ServiceAreaV1LocationsControls";
import {
  defaultServiceAreaV1PreviewSettings,
  serviceAreaV1BackgroundModes,
  serviceAreaV1CardBorderRadiusOptions,
  serviceAreaV1SizeOptions,
  type ServiceAreaV1BackgroundMode,
  resolveServiceAreaV1GraphSrc,
  type ServiceAreaV1PreviewSettings,
  type ServiceAreaV1Size,
} from "@/lib/service-area-preview";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadServiceAreaV1PreviewSettings,
  normalizeServiceAreaV1PreviewSettings,
  saveServiceAreaV1PreviewSettings,
} from "@/lib/service-area-preview-storage";
import {
  applyServiceAreaV1Preset,
  bundledServiceAreaV1Presets,
  isServiceAreaV1PresetId,
  listServiceAreaV1Presets,
  normalizeServiceAreaV1PresetLibrary,
  slugifyServiceAreaV1PresetId,
  type ServiceAreaV1PresetId,
  type ServiceAreaV1PresetLibrary,
} from "@/lib/service-area-v1-presets";

type ServiceAreaV1PreviewContextValue = {
  settings: ServiceAreaV1PreviewSettings;
  setSettings: (settings: ServiceAreaV1PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getSectionHeading: (fallback: string) => string;
  setSectionHeading: (heading: string) => void;
  getLocationLabel: (locationId: string, fallback: string) => string;
  setLocationLabel: (locationId: string, label: string) => void;
  getGraphImageSrc: () => string | null;
  setGraphImage: (src: string) => void;
  clearGraphImage: () => void;
};

const ServiceAreaV1PreviewContext = createContext<ServiceAreaV1PreviewContextValue | null>(null);

type ServiceAreaV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ServiceAreaV1PreviewSettings;
  enableContentEditing?: boolean;
};

export function ServiceAreaV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: ServiceAreaV1PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "serviceAreaV1",
    initialSettings,
    defaultSettings: defaultServiceAreaV1PreviewSettings,
    loadGlobal: loadServiceAreaV1PreviewSettings,
    saveGlobal: saveServiceAreaV1PreviewSettings,
    normalize: normalizeServiceAreaV1PreviewSettings,
  });

  const setSettings = useCallback(
    (next: ServiceAreaV1PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getSectionHeading = useCallback(
    (fallback: string): string => {
      return settings.sectionHeading ?? fallback;
    },
    [settings.sectionHeading],
  );

  const setSectionHeading = useCallback(
    (heading: string) => {
      if (!enableContentEditing) return;
      const trimmed = heading.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        sectionHeading: trimmed,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getLocationLabel = useCallback(
    (locationId: string, fallback: string): string => {
      return settings.locationLabels[locationId] ?? fallback;
    },
    [settings.locationLabels],
  );

  const setLocationLabel = useCallback(
    (locationId: string, label: string) => {
      if (!enableContentEditing) return;
      const trimmed = label.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        locationLabels: {
          ...settings.locationLabels,
          [locationId]: trimmed,
        },
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getGraphImageSrc = useCallback((): string | null => {
    return resolveServiceAreaV1GraphSrc(settings);
  }, [settings]);

  const setGraphImage = useCallback(
    (src: string) => {
      if (!enableContentEditing) return;
      const trimmed = src.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        graphImageSrc: trimmed,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const clearGraphImage = useCallback(() => {
    if (!enableContentEditing) return;
    setSettings({
      ...settings,
      graphImageSrc: "",
    });
  }, [enableContentEditing, settings, setSettings]);

  return (
    <ServiceAreaV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getSectionHeading,
        setSectionHeading,
        getLocationLabel,
        setLocationLabel,
        getGraphImageSrc,
        setGraphImage,
        clearGraphImage,
      }}
    >
      {children}
    </ServiceAreaV1PreviewContext.Provider>
  );
}

export function useServiceAreaV1Preview() {
  return useContext(ServiceAreaV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const rangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

function applyLibraryPayload(library: unknown): ServiceAreaV1PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeServiceAreaV1PresetLibrary(library);
}

function defaultOverwritePresetId(
  library: ServiceAreaV1PresetLibrary,
  presetId: ServiceAreaV1PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listServiceAreaV1Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function ServiceAreaV1PreviewControls() {
  const context = useServiceAreaV1Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<ServiceAreaV1PresetId | "">("");
  const [library, setLibrary] = useState(bundledServiceAreaV1Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/service-area-v1-presets")
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

  const settings = normalizeServiceAreaV1PreviewSettings(context.settings);
  const presets = listServiceAreaV1Presets(library);

  const update = (patch: Partial<ServiceAreaV1PreviewSettings>) => {
    context.setSettings(normalizeServiceAreaV1PreviewSettings({ ...settings, ...patch }));
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/service-area-v1-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isServiceAreaV1PresetId(data.id)) {
        setPresetId(data.id);
      }
      setSaveOpen(false);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1600);
    } catch {
      setSaveState("error");
    }
  }

  const isGradient = settings.backgroundMode === "gradient";

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Preset</span>
        <select
          value={presetId}
          onChange={(event) => {
            const nextId = event.target.value;
            if (!isServiceAreaV1PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyServiceAreaV1Preset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply service area starter"
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
        onClick={() => {
          setSaveState("idle");
          setSaveOpen(true);
        }}
        disabled={saveState === "saving"}
        className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs tracking-wide text-accent-purple uppercase backdrop-blur-sm hover:border-accent-purple disabled:opacity-40"
        aria-label="Save current service area as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <ServiceAreaV1SavePresetDialog
        open={saveOpen}
        busy={saveState === "saving"}
        error={saveState === "error"}
        library={library}
        defaultExistingId={defaultOverwritePresetId(library, presetId, org?.orgId)}
        onClose={() => {
          if (saveState !== "saving") setSaveOpen(false);
        }}
        onSave={(input) => void savePreset(input)}
      />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) => update({ layoutWidth: event.target.value as SiteLayoutWidth })}
          className={selectClassName}
          aria-label="Service area layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Size</span>
        <select
          value={context.settings.size}
          onChange={(event) => update({ size: event.target.value as ServiceAreaV1Size })}
          className={selectClassName}
          aria-label="Service area icon and text size"
        >
          {serviceAreaV1SizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Fill</span>
        <select
          value={context.settings.backgroundMode}
          onChange={(event) =>
            update({ backgroundMode: event.target.value as ServiceAreaV1BackgroundMode })
          }
          className={selectClassName}
          aria-label="Service area background mode"
        >
          {serviceAreaV1BackgroundModes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {!isGradient ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
          <input
            type="color"
            value={context.settings.backgroundColor}
            onChange={(event) => update({ backgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Service area solid background color"
          />
        </label>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">From</span>
            <input
              type="color"
              value={context.settings.backgroundGradientFrom}
              onChange={(event) => update({ backgroundGradientFrom: event.target.value })}
              className={colorInputClassName}
              aria-label="Service area gradient start color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">To</span>
            <input
              type="color"
              value={context.settings.backgroundGradientTo}
              onChange={(event) => update({ backgroundGradientTo: event.target.value })}
              className={colorInputClassName}
              aria-label="Service area gradient end color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={context.settings.backgroundGradientAngle}
              onChange={(event) =>
                update({ backgroundGradientAngle: Number(event.target.value) })
              }
              className={rangeClassName}
              aria-label="Service area gradient angle"
            />
            <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
              {context.settings.backgroundGradientAngle}°
            </span>
          </label>
        </>
      )}

      {context.settings.layoutWidth === "contained" && (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Outer</span>
          <input
            type="color"
            value={context.settings.outerBackgroundColor}
            onChange={(event) => update({ outerBackgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Service area outer background color"
          />
        </label>
      )}

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
        <select
          value={context.settings.cardBorderRadiusPx}
          onChange={(event) => update({ cardBorderRadiusPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Service area card border radius"
        >
          {serviceAreaV1CardBorderRadiusOptions.map((radius) => (
            <option key={radius} value={radius}>
              {radius}px
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Heading</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Service area heading color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Pin</span>
        <input
          type="color"
          value={context.settings.iconColor}
          onChange={(event) => update({ iconColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Service area pin icon color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Text</span>
        <input
          type="color"
          value={context.settings.locationTextColor}
          onChange={(event) => update({ locationTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Service area location text color"
        />
      </label>
      <ServiceAreaV1LocationsControls />
    </div>
  );
}

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function ServiceAreaV1SavePresetDialog({
  open,
  busy,
  error,
  library,
  defaultExistingId,
  onClose,
  onSave,
}: {
  open: boolean;
  busy: boolean;
  error: boolean;
  library: ServiceAreaV1PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listServiceAreaV1Presets(library);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [existingId, setExistingId] = useState(defaultExistingId);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open) return;
    setMode(defaultExistingId ? "existing" : "new");
    setExistingId(defaultExistingId);
    setNewName("");
  }, [defaultExistingId, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const newId = slugifyServiceAreaV1PresetId(newName);
  const newNameTaken = Boolean(newId && presets.some((preset) => preset.id === newId));
  const canSubmit =
    mode === "existing" ? Boolean(existingId) : Boolean(newName.trim()) && !newNameTaken;

  const dialog = (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close save preset dialog"
        disabled={busy}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-area-v1-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="service-area-v1-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this service area as-is. Choosing a starter here does not apply it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded border border-white/15 p-2 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          className="space-y-4 px-6 py-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit || busy) return;
            if (mode === "existing") {
              onSave({ id: existingId });
              return;
            }
            onSave({ id: newId, label: newName.trim() });
          }}
        >
          <fieldset className="space-y-3">
            <legend className="sr-only">Save destination</legend>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="service-area-v1-save-mode"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                className="mt-1 accent-accent-purple"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] tracking-wide text-accent-purple uppercase">
                  Overwrite existing
                </span>
                <select
                  value={existingId}
                  onChange={(event) => {
                    setExistingId(event.target.value);
                    setMode("existing");
                  }}
                  className={`${saveFieldClassName} mt-2`}
                  aria-label="Existing preset to overwrite"
                >
                  {presets.length === 0 ? (
                    <option value="">No presets yet</option>
                  ) : (
                    presets.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))
                  )}
                </select>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="service-area-v1-save-mode"
                checked={mode === "new"}
                onChange={() => setMode("new")}
                className="mt-1 accent-accent-purple"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] tracking-wide text-accent-purple uppercase">
                  Save as new
                </span>
                <input
                  value={newName}
                  onChange={(event) => {
                    setNewName(event.target.value);
                    setMode("new");
                  }}
                  className={`${saveFieldClassName} mt-2`}
                  placeholder="Langham service area"
                  autoComplete="off"
                  aria-label="New preset name"
                />
              </span>
            </label>
          </fieldset>

          {newNameTaken ? (
            <p className="text-sm text-red-400">
              That name already exists. Overwrite it above, or pick a different name.
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-400">Could not save. Try again.</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="rounded border border-white/10 px-4 py-2.5 font-mono text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !canSubmit}
              className="rounded border border-accent-purple/60 bg-accent-purple/15 px-4 py-2.5 font-mono text-sm text-accent-purple transition-colors hover:bg-accent-purple/25 disabled:opacity-50"
            >
              {busy ? "Saving…" : mode === "existing" ? "Overwrite" : "Save new"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
