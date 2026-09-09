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
import {
  defaultServicesIconsV2PreviewSettings,
  patchServicesIconsV2ServiceCard,
  servicesIconsV2BorderRadiusOptions,
  servicesIconsV2GradientDirections,
  servicesIconsV2IconShapeOptions,
  type ServicesIconsV2IconShape,
  type ServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview";
import type { SiteIconName } from "@/lib/site-icons";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadServicesIconsV2PreviewSettings,
  normalizeServicesIconsV2PreviewSettings,
  saveServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview-storage";
import {
  applyServicesIconsV2Preset,
  bundledServicesIconsV2Presets,
  isServicesIconsV2PresetId,
  listServicesIconsV2Presets,
  normalizeServicesIconsV2PresetLibrary,
  slugifyServicesIconsV2PresetId,
  type ServicesIconsV2PresetId,
  type ServicesIconsV2PresetLibrary,
} from "@/lib/services-icons-v2-presets";

type ServicesIconsV2PreviewContextValue = {
  settings: ServicesIconsV2PreviewSettings;
  setSettings: (settings: ServicesIconsV2PreviewSettings) => void;
  /** True only on /playground — card icon/label/heading/CTA editors. */
  contentEditingEnabled: boolean;
  getServiceIcon: (serviceId: string, fallback: SiteIconName) => SiteIconName;
  setServiceIcon: (serviceId: string, iconName: SiteIconName) => void;
  getServiceLabel: (serviceId: string, fallback: string) => string;
  setServiceLabel: (serviceId: string, label: string) => void;
  getServiceDescription: (serviceId: string, fallback?: string) => string | undefined;
  setServiceDescription: (serviceId: string, description: string) => void;
  setServiceCardContent: (
    serviceId: string,
    patch: { label?: string; description?: string },
  ) => void;
  getCta: (fallback: { label: string; href: string }) => { label: string; href: string };
  setCta: (label: string, href: string) => void;
  getSectionHeading: (fallback: string) => string;
  setSectionHeading: (heading: string) => void;
};

const ServicesIconsV2PreviewContext = createContext<ServicesIconsV2PreviewContextValue | null>(
  null,
);

type ServicesIconsV2PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ServicesIconsV2PreviewSettings;
  /** Playground-only — enables per-card editors and persists to localStorage. */
  enableContentEditing?: boolean;
};

export function ServicesIconsV2PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: ServicesIconsV2PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "servicesIconsV2",
    initialSettings,
    defaultSettings: defaultServicesIconsV2PreviewSettings,
    loadGlobal: loadServicesIconsV2PreviewSettings,
    saveGlobal: saveServicesIconsV2PreviewSettings,
    normalize: normalizeServicesIconsV2PreviewSettings,
  });

  const setSettings = useCallback(
    (next: ServicesIconsV2PreviewSettings) => {
      if (!enableContentEditing) return;
      persistSettings(next);
    },
    [enableContentEditing, persistSettings],
  );

  const getServiceIcon = useCallback(
    (serviceId: string, fallback: SiteIconName): SiteIconName => {
      return settings.serviceIcons[serviceId] ?? fallback;
    },
    [settings.serviceIcons],
  );

  const setServiceIcon = useCallback(
    (serviceId: string, iconName: SiteIconName) => {
      if (!enableContentEditing) return;
      setSettings({
        ...settings,
        serviceIcons: {
          ...settings.serviceIcons,
          [serviceId]: iconName,
        },
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getServiceLabel = useCallback(
    (serviceId: string, fallback: string): string => {
      return settings.serviceLabels[serviceId] ?? fallback;
    },
    [settings.serviceLabels],
  );

  const setServiceLabel = useCallback(
    (serviceId: string, label: string) => {
      if (!enableContentEditing) return;
      const trimmed = label.trim();
      if (!trimmed) return;
      setSettings(patchServicesIconsV2ServiceCard(settings, serviceId, { label: trimmed }));
    },
    [enableContentEditing, settings, setSettings],
  );

  const getServiceDescription = useCallback(
    (serviceId: string, fallback?: string): string | undefined => {
      return settings.serviceDescriptions[serviceId] ?? fallback;
    },
    [settings.serviceDescriptions],
  );

  const setServiceDescription = useCallback(
    (serviceId: string, description: string) => {
      if (!enableContentEditing) return;
      setSettings(
        patchServicesIconsV2ServiceCard(settings, serviceId, { description }),
      );
    },
    [enableContentEditing, settings, setSettings],
  );

  const setServiceCardContent = useCallback(
    (serviceId: string, patch: { label?: string; description?: string }) => {
      if (!enableContentEditing) return;
      if (patch.label !== undefined && !patch.label.trim()) return;
      setSettings(patchServicesIconsV2ServiceCard(settings, serviceId, patch));
    },
    [enableContentEditing, settings, setSettings],
  );

  const getCta = useCallback(
    (fallback: { label: string; href: string }) => ({
      label: settings.ctaLabel ?? fallback.label,
      href: settings.ctaHref ?? fallback.href,
    }),
    [settings.ctaLabel, settings.ctaHref],
  );

  const setCta = useCallback(
    (label: string, href: string) => {
      if (!enableContentEditing) return;
      const trimmedLabel = label.trim();
      const trimmedHref = href.trim();
      if (!trimmedLabel || !trimmedHref.startsWith("tel:")) return;
      setSettings({
        ...settings,
        ctaLabel: trimmedLabel,
        ctaHref: trimmedHref,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getSectionHeading = useCallback(
    (fallback: string): string => settings.sectionHeading ?? fallback,
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

  return (
    <ServicesIconsV2PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getServiceIcon,
        setServiceIcon,
        getServiceLabel,
        setServiceLabel,
        getServiceDescription,
        setServiceDescription,
        setServiceCardContent,
        getCta,
        setCta,
        getSectionHeading,
        setSectionHeading,
      }}
    >
      {children}
    </ServicesIconsV2PreviewContext.Provider>
  );
}

export function useServicesIconsV2Preview() {
  return useContext(ServicesIconsV2PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const cardFontSizeOptions = [18, 20, 22, 24, 26, 28, 30] as const;
const headingFontSizeOptions = [32, 36, 40, 44, 48, 52, 56, 60] as const;

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function applyLibraryPayload(library: unknown): ServicesIconsV2PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeServicesIconsV2PresetLibrary(library);
}

function defaultOverwritePresetId(
  library: ServicesIconsV2PresetLibrary,
  presetId: ServicesIconsV2PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listServicesIconsV2Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function ServicesIconsV2PreviewControls() {
  const context = useServicesIconsV2Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<ServicesIconsV2PresetId | "">("");
  const [library, setLibrary] = useState(bundledServicesIconsV2Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services-icons-v2-presets")
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

  if (!context?.contentEditingEnabled) return null;

  const settings = normalizeServicesIconsV2PreviewSettings(context.settings);
  const presets = listServicesIconsV2Presets(library);

  const update = (patch: Partial<ServicesIconsV2PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/services-icons-v2-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isServicesIconsV2PresetId(data.id)) {
        setPresetId(data.id);
      }
      setSaveOpen(false);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1600);
    } catch {
      setSaveState("error");
    }
  }

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Preset</span>
        <select
          value={presetId}
          onChange={(event) => {
            const nextId = event.target.value;
            if (!isServicesIconsV2PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyServicesIconsV2Preset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply services-icons starter"
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
        aria-label="Save current services-icons as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <ServicesIconsV2SavePresetDialog
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
          aria-label="Services icons v2 layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {context.settings.layoutWidth === "contained" && (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Outer BG
          </span>
          <input
            type="color"
            value={context.settings.outerBackgroundColor}
            onChange={(event) => update({ outerBackgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Services icons v2 outer background color"
          />
        </label>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.backgroundFrom}
          onChange={(event) => update({ backgroundFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.backgroundTo}
          onChange={(event) => update({ backgroundTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 background gradient end color"
        />
      </label>
      <select
        value={context.settings.backgroundDirection}
        onChange={(event) =>
          update({ backgroundDirection: event.target.value as PreviewGradientDirection })
        }
        className={selectClassName}
        aria-label="Services icons v2 background gradient direction"
      >
        {servicesIconsV2GradientDirections.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Card BG</span>
        <input
          type="color"
          value={context.settings.cardBackgroundColor}
          onChange={(event) => update({ cardBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 service card background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Card Text</span>
        <input
          type="color"
          value={context.settings.cardTextColor}
          onChange={(event) => update({ cardTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 service card text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Circle</span>
        <input
          type="color"
          value={context.settings.circleColor}
          onChange={(event) => update({ circleColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 icon background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Shape</span>
        <select
          value={context.settings.iconShape}
          onChange={(event) =>
            update({ iconShape: event.target.value as ServicesIconsV2IconShape })
          }
          className={selectClassName}
          aria-label="Services icons v2 icon frame shape"
        >
          {servicesIconsV2IconShapeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Icon</span>
        <input
          type="color"
          value={context.settings.iconColor}
          onChange={(event) => update({ iconColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 icon color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">CTA BG</span>
        <input
          type="color"
          value={context.settings.ctaBackgroundColor}
          onChange={(event) => update({ ctaBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 call card background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">CTA Text</span>
        <input
          type="color"
          value={context.settings.ctaTextColor}
          onChange={(event) => update({ ctaTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 call card text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Services icons v2 heading color"
        />
      </label>
      <select
        value={context.settings.headingFontSizePx}
        onChange={(event) => update({ headingFontSizePx: Number(event.target.value) })}
        className={selectClassName}
        aria-label="Services icons v2 heading font size"
      >
        {headingFontSizeOptions.map((size) => (
          <option key={size} value={size}>
            Title {size}px
          </option>
        ))}
      </select>
      <select
        value={context.settings.cardFontSizePx}
        onChange={(event) => update({ cardFontSizePx: Number(event.target.value) })}
        className={selectClassName}
        aria-label="Services icons v2 card font size"
      >
        {cardFontSizeOptions.map((size) => (
          <option key={size} value={size}>
            Card {size}px
          </option>
        ))}
      </select>
      <select
        value={context.settings.cardBorderRadiusPx}
        onChange={(event) => update({ cardBorderRadiusPx: Number(event.target.value) })}
        className={selectClassName}
        aria-label="Services icons v2 card corner radius"
      >
        {servicesIconsV2BorderRadiusOptions.map((radius) => (
          <option key={radius} value={radius}>
            Radius {radius}px
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => context.setSettings(defaultServicesIconsV2PreviewSettings)}
        className={buttonClassName}
        aria-label="Reset Services icons v2 settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}

function ServicesIconsV2SavePresetDialog({
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
  library: ServicesIconsV2PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listServicesIconsV2Presets(library);
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

  const newId = slugifyServicesIconsV2PresetId(newName);
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
        aria-labelledby="services-icons-v2-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="services-icons-v2-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this services-icons block as-is. Choosing a starter here does not apply it.
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
                name="services-icons-v2-save-mode"
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
                name="services-icons-v2-save-mode"
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
                  placeholder="Spartan restoration"
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
