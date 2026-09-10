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
  slugifyServiceAreaV2PresetId,
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

function defaultOverwritePresetId(
  library: ServiceAreaV2PresetLibrary,
  presetId: ServiceAreaV2PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listServiceAreaV2Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

export function ServiceAreaV2PreviewControls() {
  const context = useServiceAreaV2Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<ServiceAreaV2PresetId | "">("");
  const [library, setLibrary] = useState(bundledServiceAreaV2Presets);
  const [saveOpen, setSaveOpen] = useState(false);
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

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/service-area-v2-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isServiceAreaV2PresetId(data.id)) {
        setPresetId(data.id);
      }
      setSaveOpen(false);
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
    <div className="contents">
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
        onClick={() => {
          setSaveState("idle");
          setSaveOpen(true);
        }}
        disabled={saveState === "saving"}
        className={buttonClassName}
        aria-label="Save current service area as a preset"
      >
        {saveState === "saving"
          ? "Saving…"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <ServiceAreaV2SavePresetDialog
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
      <div className="flex flex-wrap items-center gap-2">

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

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs text-accent-purple/80">Card body</span>
        <input
          type="color"
          value={settings.cardBodyColor ?? settings.cardMutedColor}
          onChange={(event) => update({ cardBodyColor: event.target.value })}
          aria-label="Card body text color"
          className={`${colorInputClassName}${settings.cardBodyColor ? "" : " opacity-40"}`}
        />
        {settings.cardBodyColor ? (
          <button
            type="button"
            onClick={() => update({ cardBodyColor: undefined })}
            className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
          >
            Default
          </button>
        ) : null}
      </label>

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
    </div>
  );
}

function ServiceAreaV2SavePresetDialog({
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
  library: ServiceAreaV2PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listServiceAreaV2Presets(library);
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

  const newId = slugifyServiceAreaV2PresetId(newName);
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
        aria-labelledby="service-area-v2-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="service-area-v2-save-preset-title"
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
                name="service-area-v2-save-mode"
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
                name="service-area-v2-save-mode"
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
                  placeholder="Stone Pillar service area"
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
