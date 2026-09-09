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
import { ContactFormFieldsControls } from "@/components/dev/ContactFormFieldsControls";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import {
  contactBackgroundModes,
  contactButtonBorderRadiusOptions,
  contactPhoneColorPickerFallback,
  defaultContactButtonSettings,
  defaultContactPreviewSettings,
  resolveContactContent,
  type ContactBackgroundMode,
  type ContactContent,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadContactPreviewSettings,
  normalizeContactPreviewSettings,
  saveContactPreviewSettings,
} from "@/lib/contact-preview-storage";
import {
  applyContactPreset,
  bundledContactPresets,
  isContactPresetId,
  listContactPresets,
  normalizeContactPresetLibrary,
  slugifyContactPresetId,
  type ContactPresetId,
  type ContactPresetLibrary,
} from "@/lib/contact-presets";
import { phoneTelHref } from "@/lib/phone";

type ContactV1PreviewContextValue = {
  settings: ContactPreviewSettings;
  setSettings: (settings: ContactPreviewSettings) => void;
  contentEditingEnabled: boolean;
  getContent: (defaults: ContactContent) => ContactContent;
  setContentTitle: (value: string) => void;
  setContentSubtext: (value: string) => void;
  setContentPhoneLine: (phonePrefix: string, phoneLabel: string) => void;
  setContentSubmitText: (value: string) => void;
};

const ContactV1PreviewContext = createContext<ContactV1PreviewContextValue | null>(null);

type ContactV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ContactPreviewSettings;
  enableContentEditing?: boolean;
  /** One shared contact popup site-wide (like nav). */
  globalOnly?: boolean;
};

export function ContactV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
  globalOnly = false,
}: ContactV1PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "contact",
    initialSettings,
    defaultSettings: defaultContactPreviewSettings,
    loadGlobal: loadContactPreviewSettings,
    saveGlobal: saveContactPreviewSettings,
    normalize: normalizeContactPreviewSettings,
    globalOnly,
  });

  const setSettings = useCallback(
    (next: ContactPreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getContent = useCallback(
    (defaults: ContactContent) => resolveContactContent(defaults, settings),
    [settings],
  );

  const setContentTitle = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentTitle: value });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentSubtext = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, contentSubtext: value });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentPhoneLine = useCallback(
    (phonePrefix: string, phoneLabel: string) => {
      if (!enableContentEditing) return;
      setSettings({
        ...settings,
        contentPhonePrefix: phonePrefix,
        contentPhoneLabel: phoneLabel,
        contentPhoneHref: phoneLabel ? phoneTelHref(phoneLabel) : "",
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const setContentSubmitText = useCallback(
    (value: string) => {
      if (!enableContentEditing) return;
      setSettings({ ...settings, submitText: value });
    },
    [enableContentEditing, settings, setSettings],
  );

  return (
    <ContactV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getContent,
        setContentTitle,
        setContentSubtext,
        setContentPhoneLine,
        setContentSubmitText,
      }}
    >
      {children}
    </ContactV1PreviewContext.Provider>
  );
}

export function useContactV1Preview() {
  return useContext(ContactV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const rangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const textInputClassName =
  "w-28 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

function applyLibraryPayload(library: unknown): ContactPresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeContactPresetLibrary(library);
}

function defaultOverwritePresetId(
  library: ContactPresetLibrary,
  presetId: ContactPresetId | "",
  orgId: string | undefined,
): string {
  const entries = listContactPresets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function ContactV1PreviewControls() {
  const context = useContactV1Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<ContactPresetId | "">("");
  const [library, setLibrary] = useState(bundledContactPresets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/contact-presets")
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

  const settings = normalizeContactPreviewSettings(context.settings);
  const presets = listContactPresets(library);

  const update = (patch: Partial<ContactPreviewSettings>) => {
    context.setSettings({ ...settings, ...patch });
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/contact-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isContactPresetId(data.id)) {
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
            if (!isContactPresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyContactPreset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply contact form starter"
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
        aria-label="Save current contact form as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <ContactSavePresetDialog
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
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Section</span>
        <input
          type="color"
          value={context.settings.sectionBackgroundColor ?? "#ffffff"}
          onChange={(event) => update({ sectionBackgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact section background color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Fill</span>
        <select
          value={context.settings.backgroundMode}
          onChange={(event) =>
            update({ backgroundMode: event.target.value as ContactBackgroundMode })
          }
          className={selectClassName}
          aria-label="Contact card background mode"
        >
          {contactBackgroundModes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {!isGradient ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Color</span>
          <input
            type="color"
            value={context.settings.solidColor}
            onChange={(event) => update({ solidColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Contact card solid color"
          />
        </label>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">From</span>
            <input
              type="color"
              value={context.settings.gradientFrom}
              onChange={(event) => update({ gradientFrom: event.target.value })}
              className={colorInputClassName}
              aria-label="Contact card gradient start color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">To</span>
            <input
              type="color"
              value={context.settings.gradientTo}
              onChange={(event) => update({ gradientTo: event.target.value })}
              className={colorInputClassName}
              aria-label="Contact card gradient end color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={context.settings.gradientAngle}
              onChange={(event) => update({ gradientAngle: Number(event.target.value) })}
              className={rangeClassName}
              aria-label="Contact card gradient angle"
            />
          </label>
        </>
      )}

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
        <input
          type="range"
          min={8}
          max={48}
          value={context.settings.borderRadius}
          onChange={(event) => update({ borderRadius: Number(event.target.value) })}
          className={rangeClassName}
          aria-label="Contact card border radius"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="color"
          value={context.settings.titleColor}
          onChange={(event) => update({ titleColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact card title color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <input
          type="color"
          value={context.settings.bodyColor}
          onChange={(event) => update({ bodyColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact card body color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Phone</span>
        <input
          type="color"
          value={context.settings.phoneColor ?? contactPhoneColorPickerFallback}
          onChange={(event) => update({ phoneColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact card phone number color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Submit-Text
        </span>
        <input
          type="text"
          value={context.settings.submitText ?? defaultContactButtonSettings.submitText}
          onChange={(event) => update({ submitText: event.target.value })}
          className={textInputClassName}
          aria-label="Contact form submit button text"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn</span>
        <input
          type="color"
          value={context.settings.buttonBackground ?? defaultContactButtonSettings.buttonBackground}
          onChange={(event) => update({ buttonBackground: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact form submit button background"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn text</span>
        <input
          type="color"
          value={context.settings.buttonTextColor ?? defaultContactButtonSettings.buttonTextColor}
          onChange={(event) => update({ buttonTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Contact form submit button text color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn radius</span>
        <select
          value={context.settings.buttonRadiusPx ?? defaultContactButtonSettings.buttonRadiusPx}
          onChange={(event) => update({ buttonRadiusPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Contact form submit button border radius"
        >
          {contactButtonBorderRadiusOptions.map((option) => (
            <option key={option} value={option}>
              {option}px
            </option>
          ))}
        </select>
      </label>

      <ContactFormFieldsControls />

      <button
        type="button"
        onClick={() => context.setSettings(defaultContactPreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function ContactSavePresetDialog({
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
  library: ContactPresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listContactPresets(library);
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

  const newId = slugifyContactPresetId(newName);
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
        aria-labelledby="contact-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="contact-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this contact form as-is. Choosing a starter here does not apply it.
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
                name="contact-save-mode"
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
                name="contact-save-mode"
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
                  placeholder="Langham quote"
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
