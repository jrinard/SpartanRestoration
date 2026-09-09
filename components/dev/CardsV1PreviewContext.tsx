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
  cardsV1BookEndWidthOptions,
  cardsV1CardBorderRadiusOptions,
  cardsV1CardBorderWidthOptions,
  cardsV1GradientDirections,
  cardsV1LabelFontStyleOptions,
  defaultCardsV1PreviewSettings,
  isCardsV1LabelFontStyle,
  normalizeCardsV1BookEndWidth,
  type CardsV1Card,
  type CardsV1PreviewSettings,
} from "@/lib/cards-v1-preview";
import { updateCardsV1Card } from "@/lib/cards-v1-cards";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadCardsV1PreviewSettings,
  normalizeCardsV1PreviewSettings,
  saveCardsV1PreviewSettings,
} from "@/lib/cards-v1-preview-storage";
import {
  applyCardsV1Preset,
  bundledCardsV1Presets,
  isCardsV1PresetId,
  listCardsV1Presets,
  normalizeCardsV1PresetLibrary,
  slugifyCardsV1PresetId,
  type CardsV1PresetId,
  type CardsV1PresetLibrary,
} from "@/lib/cards-v1-presets";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";

type CardsV1PreviewContextValue = {
  settings: CardsV1PreviewSettings;
  setSettings: (settings: CardsV1PreviewSettings) => void;
  contentEditingEnabled: boolean;
  updateCard: (
    cardId: string,
    patch: Partial<Pick<CardsV1Card, "title" | "subtitle" | "imageSrc" | "variant">>,
  ) => void;
};

const CardsV1PreviewContext = createContext<CardsV1PreviewContextValue | null>(null);

type CardsV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: CardsV1PreviewSettings;
  enableContentEditing?: boolean;
};

export function CardsV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: CardsV1PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "cardsV1",
    initialSettings,
    defaultSettings: defaultCardsV1PreviewSettings,
    loadGlobal: loadCardsV1PreviewSettings,
    saveGlobal: saveCardsV1PreviewSettings,
    normalize: normalizeCardsV1PreviewSettings,
  });

  const updateCard = useCallback(
    (cardId: string, patch: Partial<Pick<CardsV1Card, "title" | "subtitle" | "imageSrc" | "variant">>) => {
      setSettings({
        ...settings,
        cards: updateCardsV1Card(settings.cards, cardId, patch),
      });
    },
    [setSettings, settings],
  );

  return (
    <CardsV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        updateCard,
      }}
    >
      {children}
    </CardsV1PreviewContext.Provider>
  );
}

export function useCardsV1Preview() {
  return useContext(CardsV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const checkboxClassName = "h-4 w-4 accent-accent-purple";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

function applyLibraryPayload(library: unknown): CardsV1PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeCardsV1PresetLibrary(library);
}

function defaultOverwritePresetId(
  library: CardsV1PresetLibrary,
  presetId: CardsV1PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listCardsV1Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function CardsV1PreviewControls() {
  const context = useCardsV1Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<CardsV1PresetId | "">("");
  const [library, setLibrary] = useState(bundledCardsV1Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cards-v1-presets")
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

  const settings = normalizeCardsV1PreviewSettings(context.settings);
  const presets = listCardsV1Presets(library);

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/cards-v1-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isCardsV1PresetId(data.id)) {
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
            if (!isCardsV1PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyCardsV1Preset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply cards starter"
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
        aria-label="Save current cards as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <CardsV1SavePresetDialog
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
          value={settings.layoutWidth}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              layoutWidth: event.target.value as SiteLayoutWidth,
            })
          }
          className={selectClassName}
          aria-label="Cards layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {settings.layoutWidth === "contained" ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Outer BG
          </span>
          <input
            type="color"
            value={settings.outerBackgroundColor || "#000000"}
            onChange={(event) =>
              context.setSettings({
                ...settings,
                outerBackgroundColor: event.target.value,
              })
            }
            className={`${colorInputClassName}${settings.outerBackgroundColor ? "" : " opacity-40"}`}
            aria-label="Cards outer background color"
          />
          {settings.outerBackgroundColor ? (
            <button
              type="button"
              onClick={() => context.setSettings({ ...settings, outerBackgroundColor: "" })}
              className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
            >
              None
            </button>
          ) : (
            <span className="font-mono text-[0.65rem] text-accent-purple/60">None</span>
          )}
        </label>
      ) : null}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={settings.backgroundFrom || "#000000"}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              backgroundFrom: event.target.value,
              backgroundTo: settings.backgroundTo || event.target.value,
            })
          }
          className={`${colorInputClassName}${settings.backgroundFrom ? "" : " opacity-40"}`}
          aria-label="Cards background start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={settings.backgroundTo || settings.backgroundFrom || "#000000"}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              backgroundTo: event.target.value,
              backgroundFrom: settings.backgroundFrom || event.target.value,
            })
          }
          className={`${colorInputClassName}${settings.backgroundTo || settings.backgroundFrom ? "" : " opacity-40"}`}
          aria-label="Cards background end color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Dir</span>
        <select
          value={settings.backgroundDirection ?? "none"}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              backgroundDirection: event.target.value as PreviewGradientDirection,
            })
          }
          className={selectClassName}
          aria-label="Cards background gradient direction"
        >
          {cardsV1GradientDirections.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {settings.backgroundFrom ? (
        <button
          type="button"
          onClick={() =>
            context.setSettings({
              ...settings,
              backgroundFrom: "",
              backgroundTo: "",
              backgroundDirection: "none",
            })
          }
          className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
        >
          None
        </button>
      ) : null}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
        <select
          value={settings.cardBorderRadiusPx}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              cardBorderRadiusPx: Number(event.target.value),
            })
          }
          className={selectClassName}
          aria-label="Cards border radius"
        >
          {cardsV1CardBorderRadiusOptions.map((radius) => (
            <option key={radius} value={radius}>
              {radius}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Border</span>
        <input
          type="color"
          value={settings.cardBorderColor || "#ffffff"}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              cardBorderColor: event.target.value,
            })
          }
          className={colorInputClassName}
          aria-label="Cards border color"
        />
      </label>
      {settings.cardBorderColor ? (
        <button
          type="button"
          onClick={() => context.setSettings({ ...settings, cardBorderColor: "" })}
          className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
        >
          Theme
        </button>
      ) : null}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Weight</span>
        <select
          value={settings.cardBorderWidthPx}
          onChange={(event) =>
            context.setSettings({
              ...settings,
              cardBorderWidthPx: Number(event.target.value),
            })
          }
          className={selectClassName}
          aria-label="Cards border thickness"
        >
          {cardsV1CardBorderWidthOptions.map((width) => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.showBookEnds}
          onChange={(event) =>
            context.setSettings({ ...settings, showBookEnds: event.target.checked })
          }
          className={checkboxClassName}
          aria-label="Show book-end stripes beside the cards"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Book-ends
        </span>
      </label>
      {settings.showBookEnds ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
            Width
          </span>
          <select
            value={settings.bookEndWidthPx}
            onChange={(event) =>
              context.setSettings({
                ...settings,
                bookEndWidthPx: normalizeCardsV1BookEndWidth(
                  event.target.value === "full" ? "full" : Number(event.target.value),
                ),
              })
            }
            className={selectClassName}
            aria-label="Book-end stripe width"
          >
            {cardsV1BookEndWidthOptions.map((width) => (
              <option key={width} value={width}>
                {width}px
              </option>
            ))}
            <option value="full">Full</option>
          </select>
        </label>
      ) : null}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Style</span>
        <select
          value={settings.labelFontStyle}
          onChange={(event) => {
            if (!isCardsV1LabelFontStyle(event.target.value)) return;
            context.setSettings({
              ...settings,
              labelFontStyle: event.target.value,
            });
          }}
          className={selectClassName}
          aria-label="Heading and card label font style"
        >
          {cardsV1LabelFontStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Heading</span>
        <input
          type="color"
          value={settings.headingColor}
          onChange={(event) =>
            context.setSettings({ ...settings, headingColor: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Cards heading color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Line</span>
        <input
          type="color"
          value={settings.subtitleColor}
          onChange={(event) =>
            context.setSettings({ ...settings, subtitleColor: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Card one-liner color"
        />
      </label>
    </div>
  );
}

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function CardsV1SavePresetDialog({
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
  library: CardsV1PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listCardsV1Presets(library);
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

  const newId = slugifyCardsV1PresetId(newName);
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
        aria-labelledby="cards-v1-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="cards-v1-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep these cards as-is. Choosing a starter here does not apply it.
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
                name="cards-v1-save-mode"
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
                name="cards-v1-save-mode"
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
                  placeholder="Langham siding"
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
