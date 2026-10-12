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
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import {
  defaultFooterV4PreviewSettings,
  footerV4LogoOffsetXOptions,
  footerV4LogoSizeOptions,
  resolveFooterV4Content,
  resolveFooterV4LogoOffsetXPx,
  stepFooterV4LogoSizePx,
  type FooterV4Content,
  normalizeFooterV4PreviewSettings,
  type FooterV4ContentOverrides,
  type FooterV4PreviewSettings,
} from "@/lib/footer-v4-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadFooterV4PreviewSettings,
  saveFooterV4ContentOverrides,
  saveFooterV4PreviewSettings,
} from "@/lib/footer-v4-preview-storage";
import {
  applyFooterV4Preset,
  bundledFooterV4Presets,
  isFooterV4PresetId,
  listFooterV4Presets,
  normalizeFooterV4PresetLibrary,
  slugifyFooterV4PresetId,
  type FooterV4PresetId,
  type FooterV4PresetLibrary,
} from "@/lib/footer-v4-presets";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import { siteConfig } from "@/config/site";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type FooterV4PreviewContextValue = {
  settings: FooterV4PreviewSettings;
  setSettings: (settings: FooterV4PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: FooterV4Content) => FooterV4Content;
  saveContentOverrides: (patch: FooterV4ContentOverrides) => void;
};

const FooterV4PreviewContext = createContext<FooterV4PreviewContextValue | null>(null);

type FooterV4PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: FooterV4PreviewSettings;
  enableContentEditing?: boolean;
};

export function FooterV4PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: FooterV4PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "footerV4",
    initialSettings,
    defaultSettings: defaultFooterV4PreviewSettings,
    loadGlobal: loadFooterV4PreviewSettings,
    saveGlobal: saveFooterV4PreviewSettings,
    normalize: normalizeFooterV4PreviewSettings,
    globalOnly: true,
  });

  const getContent = useCallback(
    (defaults: FooterV4Content) =>
      resolveFooterV4Content(defaults, settings, siteConfig.name),
    [settings],
  );

  const saveContentOverrides = useCallback(
    (patch: FooterV4ContentOverrides) => {
      saveFooterV4ContentOverrides(patch);
      setSettings(normalizeFooterV4PreviewSettings({ ...settings, ...patch }));
    },
    [setSettings, settings],
  );

  return (
    <FooterV4PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        saveContentOverrides,
      }}
    >
      {children}
    </FooterV4PreviewContext.Provider>
  );
}

export function useFooterV4Preview() {
  return useContext(FooterV4PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const checkboxClassName = "h-4 w-4 accent-accent-purple";

function applyLibraryPayload(library: unknown): FooterV4PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeFooterV4PresetLibrary(library);
}

function defaultOverwritePresetId(
  library: FooterV4PresetLibrary,
  presetId: FooterV4PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listFooterV4Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function FooterV4PreviewControls() {
  const context = useFooterV4Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<FooterV4PresetId | "">("");
  const [library, setLibrary] = useState(bundledFooterV4Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [bannerImagePickerOpen, setBannerImagePickerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/footer-v4-presets")
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

  const settings = normalizeFooterV4PreviewSettings(context.settings);
  const presets = listFooterV4Presets(library);
  const update = (patch: Partial<FooterV4PreviewSettings>) => {
    context.setSettings(normalizeFooterV4PreviewSettings({ ...settings, ...patch }));
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/footer-v4-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isFooterV4PresetId(data.id)) {
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
            if (!isFooterV4PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyFooterV4Preset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply footer starter"
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
        aria-label="Save current footer as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <FooterV4SavePresetDialog
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
      <label className="flex items-center gap-2" title="Gradient background — left / start color">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Grad L</span>
        <input
          type="color"
          value={settings.bannerFrom}
          onChange={(event) => update({ bannerFrom: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer gradient start color"
        />
      </label>
      <label className="flex items-center gap-2" title="Gradient background — right / end color">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Grad R</span>
        <input
          type="color"
          value={settings.bannerTo}
          onChange={(event) => update({ bannerTo: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer gradient end color"
        />
      </label>
      <div className="relative flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Grad BG</span>
        <button
          type="button"
          onClick={() => setBannerImagePickerOpen((open) => !open)}
          className={cn(buttonClassName, "flex items-center gap-1.5")}
          aria-label="Choose footer banner background image from library"
          aria-expanded={bannerImagePickerOpen}
        >
          <Images size={devLibraryIconSize} strokeWidth={2} />
          <span className={devLibraryLabelClassName}>Library</span>
        </button>
        {settings.bannerBackgroundImageSrc ? (
          <>
            <span
              className="max-w-28 truncate font-mono text-[0.65rem] text-accent-purple/80"
              title={settings.bannerBackgroundImageSrc}
            >
              {settings.bannerBackgroundImageSrc.split("/").pop()}
            </span>
            <button
              type="button"
              onClick={() => update({ bannerBackgroundImageSrc: "" })}
              className={buttonClassName}
              aria-label="Clear footer banner background image"
            >
              Clear
            </button>
          </>
        ) : (
          <span className="font-mono text-[0.65rem] text-accent-purple/60">None</span>
        )}
        {bannerImagePickerOpen ? (
          <div className="absolute top-full left-0 z-50 mt-2">
            <ImageLibraryPicker
              value={settings.bannerBackgroundImageSrc || undefined}
              onSelect={(entry) => {
                update({ bannerBackgroundImageSrc: entry.src });
                setBannerImagePickerOpen(false);
              }}
              onClose={() => setBannerImagePickerOpen(false)}
              className="w-[min(92vw,52rem)]"
            />
          </div>
        ) : null}
      </div>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Heading</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer heading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Text</span>
        <input
          type="color"
          value={context.settings.textColor}
          onChange={(event) => update({ textColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Links</span>
        <input
          type="color"
          value={context.settings.linkColor}
          onChange={(event) => update({ linkColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer link color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Link hover</span>
        <input
          type="color"
          value={context.settings.linkHoverColor}
          onChange={(event) => update({ linkHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer link hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Social</span>
        <input
          type="color"
          value={context.settings.socialColor}
          onChange={(event) => update({ socialColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer social color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Social hover</span>
        <input
          type="color"
          value={context.settings.socialHoverColor}
          onChange={(event) => update({ socialHoverColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer social hover color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bottom bg</span>
        <input
          type="color"
          value={context.settings.bottomBarBackgroundColor}
          onChange={(event) => update({ bottomBarBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer bottom bar background"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bottom text</span>
        <input
          type="color"
          value={context.settings.bottomBarTextColor}
          onChange={(event) => update({ bottomBarTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Footer bottom bar text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Logo</span>
        <button
          type="button"
          onClick={() =>
            update({
              logoSizePx: stepFooterV4LogoSizePx(context.settings.logoSizePx, -1),
            })
          }
          className={buttonClassName}
          aria-label="Decrease footer logo size"
        >
          −
        </button>
        <select
          value={context.settings.logoSizePx}
          onChange={(event) => update({ logoSizePx: Number.parseInt(event.target.value, 10) })}
          className={selectClassName}
          aria-label="Footer logo size"
        >
          {footerV4LogoSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() =>
            update({
              logoSizePx: stepFooterV4LogoSizePx(context.settings.logoSizePx, 1),
            })
          }
          className={buttonClassName}
          aria-label="Increase footer logo size"
        >
          +
        </button>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Logo X
        </span>
        <select
          value={resolveFooterV4LogoOffsetXPx(context.settings)}
          onChange={(event) =>
            update({ logoOffsetXPx: Number.parseInt(event.target.value, 10) })
          }
          className={selectClassName}
          aria-label="Footer logo horizontal offset"
        >
          {footerV4LogoOffsetXOptions.map((offset) => (
            <option key={offset} value={offset}>
              {offset === 0 ? "0" : `${offset}px`}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={context.settings.showFacebook}
          onChange={(event) => update({ showFacebook: event.target.checked })}
          className={checkboxClassName}
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Facebook</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={context.settings.showInstagram}
          onChange={(event) => update({ showInstagram: event.target.checked })}
          className={checkboxClassName}
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Instagram</span>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultFooterV4PreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}

export function FooterV4SocialControls() {
  const context = useFooterV4Preview();
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  if (!context?.contentEditingEnabled) return null;

  const commitFacebook = () => {
    context.saveContentOverrides({ contentFacebookUrl: facebookUrl.trim() });
  };

  const commitInstagram = () => {
    context.saveContentOverrides({ contentInstagramUrl: instagramUrl.trim() });
  };

  return (
    <div className="flex w-full basis-full flex-wrap items-end gap-3 border-t border-accent-purple/20 pt-2">
      {context.settings.showFacebook ? (
        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Facebook URL
          </span>
          <input
            className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple focus:border-accent-purple focus:outline-none"
            defaultValue={context.settings.contentFacebookUrl ?? ""}
            onFocus={(event) => setFacebookUrl(event.target.value)}
            onChange={(event) => setFacebookUrl(event.target.value)}
            onBlur={commitFacebook}
            placeholder="https://facebook.com/..."
          />
        </label>
      ) : null}
      {context.settings.showInstagram ? (
        <label className="flex min-w-[220px] flex-1 flex-col gap-1">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Instagram URL
          </span>
          <input
            className="rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple focus:border-accent-purple focus:outline-none"
            defaultValue={context.settings.contentInstagramUrl ?? ""}
            onFocus={(event) => setInstagramUrl(event.target.value)}
            onChange={(event) => setInstagramUrl(event.target.value)}
            onBlur={commitInstagram}
            placeholder="https://instagram.com/..."
          />
        </label>
      ) : null}
    </div>
  );
}

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function FooterV4SavePresetDialog({
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
  library: FooterV4PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listFooterV4Presets(library);
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

  const newId = slugifyFooterV4PresetId(newName);
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
        aria-labelledby="footer-v4-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="footer-v4-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this footer as-is. Choosing a starter here does not apply it.
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
                name="footer-v4-save-mode"
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
                name="footer-v4-save-mode"
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
                  placeholder="Langham footer"
                  autoComplete="off"
                  aria-label="New preset name"
                />
                {newName.trim() ? (
                  <p className="mt-1 text-xs text-white/50">
                    Saves as <span className="font-mono">{newId || "—"}</span>
                  </p>
                ) : null}
              </span>
            </label>
          </fieldset>

          {mode === "existing" && existingId ? (
            <p className="text-xs text-white/50">
              Replaces the saved starter. This site stays on your current footer until you apply a
              preset again.
            </p>
          ) : null}
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
