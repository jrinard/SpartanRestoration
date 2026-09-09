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
import { Images, X } from "lucide-react";
import { IconFramePreviewControls } from "@/components/dev/IconFramePreviewControls";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import {
  defaultTextIconsV3PreviewSettings,
  patchTextIconsV3Item,
  textIconsV3GradientDirections,
  type TextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import type { SiteIconName } from "@/lib/site-icons";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadTextIconsV3PreviewSettings,
  normalizeTextIconsV3PreviewSettings,
  saveTextIconsV3PreviewSettings,
} from "@/lib/text-icons-v3-preview-storage";
import {
  applyTextIconsV3Preset,
  bundledTextIconsV3Presets,
  isTextIconsV3PresetId,
  listTextIconsV3Presets,
  normalizeTextIconsV3PresetLibrary,
  slugifyTextIconsV3PresetId,
  type TextIconsV3PresetId,
  type TextIconsV3PresetLibrary,
} from "@/lib/text-icons-v3-presets";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type TextIconsV3PreviewContextValue = {
  settings: TextIconsV3PreviewSettings;
  setSettings: (settings: TextIconsV3PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getItemIcon: (itemId: string, fallback: SiteIconName) => SiteIconName;
  setItemIcon: (itemId: string, iconName: SiteIconName) => void;
  getHeading: (fallback: string) => string;
  setHeading: (value: string) => void;
  getSubheading: (fallback: string) => string;
  setSubheading: (value: string) => void;
  getItemTitle: (itemId: string, fallback: string) => string;
  setItemTitle: (itemId: string, value: string) => void;
  getItemDescription: (itemId: string, fallback: string) => string;
  setItemDescription: (itemId: string, value: string) => void;
};

const TextIconsV3PreviewContext = createContext<TextIconsV3PreviewContextValue | null>(null);

type TextIconsV3PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TextIconsV3PreviewSettings;
  enableContentEditing?: boolean;
};

export function TextIconsV3PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: TextIconsV3PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "textIconsV3",
    initialSettings,
    defaultSettings: defaultTextIconsV3PreviewSettings,
    loadGlobal: loadTextIconsV3PreviewSettings,
    saveGlobal: saveTextIconsV3PreviewSettings,
    normalize: normalizeTextIconsV3PreviewSettings,
  });

  const setSettings = useCallback(
    (next: TextIconsV3PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getItemIcon = useCallback(
    (itemId: string, fallback: SiteIconName): SiteIconName => {
      return settings.itemIcons[itemId] ?? fallback;
    },
    [settings.itemIcons],
  );

  const setItemIcon = useCallback(
    (itemId: string, iconName: SiteIconName) => {
      if (!enableContentEditing) return;
      setSettings(patchTextIconsV3Item(settings, itemId, { icon: iconName }));
    },
    [enableContentEditing, setSettings, settings],
  );

  const getHeading = useCallback(
    (fallback: string) => settings.contentHeading ?? fallback,
    [settings.contentHeading],
  );

  const setHeading = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentHeading: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getSubheading = useCallback(
    (fallback: string) => settings.contentSubheading ?? fallback,
    [settings.contentSubheading],
  );

  const setSubheading = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentSubheading: value.trim() });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getItemTitle = useCallback(
    (itemId: string, fallback: string) => settings.itemTitles[itemId] ?? fallback,
    [settings.itemTitles],
  );

  const setItemTitle = useCallback(
    (itemId: string, value: string) => {
      if (!enableContentEditing) return;
      setSettings(patchTextIconsV3Item(settings, itemId, { title: value.trim() }));
    },
    [enableContentEditing, settings, setSettings],
  );

  const getItemDescription = useCallback(
    (itemId: string, fallback: string) => settings.itemDescriptions[itemId] ?? fallback,
    [settings.itemDescriptions],
  );

  const setItemDescription = useCallback(
    (itemId: string, value: string) => {
      if (!enableContentEditing) return;
      setSettings(patchTextIconsV3Item(settings, itemId, { description: value.trim() }));
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <TextIconsV3PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getItemIcon,
        setItemIcon,
        getHeading,
        setHeading,
        getSubheading,
        setSubheading,
        getItemTitle,
        setItemTitle,
        getItemDescription,
        setItemDescription,
      }}
    >
      {children}
    </TextIconsV3PreviewContext.Provider>
  );
}

export function useTextIconsV3Preview() {
  return useContext(TextIconsV3PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function applyLibraryPayload(library: unknown): TextIconsV3PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeTextIconsV3PresetLibrary(library);
}

function defaultOverwritePresetId(
  library: TextIconsV3PresetLibrary,
  presetId: TextIconsV3PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listTextIconsV3Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function TextIconsV3BackgroundControls() {
  const context = useTextIconsV3Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<TextIconsV3PresetId | "">("");
  const [library, setLibrary] = useState(bundledTextIconsV3Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [backgroundImagePickerOpen, setBackgroundImagePickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/text-icons-v3-presets")
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

  const settings = normalizeTextIconsV3PreviewSettings(context.settings);
  const presets = listTextIconsV3Presets(library);

  const update = (patch: Partial<TextIconsV3PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/text-icons-v3-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isTextIconsV3PresetId(data.id)) {
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
            if (!isTextIconsV3PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyTextIconsV3Preset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply text-icons starter"
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
        aria-label="Save current text-icons as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <TextIconsV3SavePresetDialog
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
          onChange={(event) =>
            update({ layoutWidth: event.target.value as SiteLayoutWidth })
          }
          className={selectClassName}
          aria-label="Text-icons v3 layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Anchor
        </span>
        <input
          type="text"
          value={context.settings.anchorId ?? ""}
          onChange={(event) =>
            update({ anchorId: event.target.value.replace(/^#/, "").trim() })
          }
          className="section-switcher-select w-28 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
          aria-label="Text-icons v3 section anchor id"
          placeholder="warranty"
        />
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
            aria-label="Text-icons v3 outer background color"
          />
        </label>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 heading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Subtitle
        </span>
        <input
          type="color"
          value={context.settings.subheadingColor}
          onChange={(event) => update({ subheadingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 subheading color"
        />
      </label>
      <IconFramePreviewControls
        settings={context.settings}
        onChange={update}
        ariaPrefix="Text-icons v3"
      />
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.backgroundFrom}
          onChange={(event) => update({ backgroundFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.backgroundTo}
          onChange={(event) => update({ backgroundTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Text-icons v3 background gradient end color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Dir</span>
        <select
          value={context.settings.backgroundDirection}
          onChange={(event) =>
            update({ backgroundDirection: event.target.value as PreviewGradientDirection })
          }
          className={selectClassName}
          aria-label="Text-icons v3 background gradient direction"
        >
          {textIconsV3GradientDirections.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="relative flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          BG Image
        </span>
        <button
          type="button"
          onClick={() => setBackgroundImagePickerOpen((open) => !open)}
          className={cn(buttonClassName, "flex items-center gap-1.5")}
          aria-label="Choose text-icons background image from library"
          aria-expanded={backgroundImagePickerOpen}
        >
          <Images size={devLibraryIconSize} strokeWidth={2} />
          <span className={devLibraryLabelClassName}>Library</span>
        </button>
        {context.settings.backgroundImageSrc ? (
          <>
            <span
              className="max-w-28 truncate font-mono text-[0.65rem] text-accent-purple/80"
              title={context.settings.backgroundImageSrc}
            >
              {context.settings.backgroundImageSrc.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => update({ backgroundImageSrc: "" })}
              className={buttonClassName}
              aria-label="Clear text-icons background image"
            >
              Clear
            </button>
          </>
        ) : (
          <span className="font-mono text-[0.65rem] text-accent-purple/60">None</span>
        )}
        {backgroundImagePickerOpen && (
          <div className="absolute top-full left-0 z-50 mt-2">
            <ImageLibraryPicker
              value={context.settings.backgroundImageSrc || undefined}
              onSelect={(entry) => {
                update({ backgroundImageSrc: entry.src });
                setBackgroundImagePickerOpen(false);
              }}
              onClose={() => setBackgroundImagePickerOpen(false)}
              className="w-[min(92vw,52rem)]"
            />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setPresetId("");
          context.setSettings(defaultTextIconsV3PreviewSettings);
        }}
        className={buttonClassName}
        aria-label="Reset Text-icons v3 background to defaults"
      >
        Reset BG
      </button>
    </div>
  );
}

function TextIconsV3SavePresetDialog({
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
  library: TextIconsV3PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listTextIconsV3Presets(library);
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

  const newId = slugifyTextIconsV3PresetId(newName);
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
        aria-labelledby="text-icons-v3-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="text-icons-v3-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this text-icons block as-is. Choosing a starter here does not apply it.
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
                name="text-icons-v3-save-mode"
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
                name="text-icons-v3-save-mode"
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
                  placeholder="Langham warranty"
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
