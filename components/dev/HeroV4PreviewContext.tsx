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
  contactButtonBorderRadiusOptions,
  defaultContactButtonSettings,
} from "@/lib/contact-preview";
import { HeroV4FormFieldsControls } from "@/components/dev/HeroV4FormFieldsControls";
import {
  defaultHeroV4ContactInfoItems,
  defaultHeroV4ContactInfoIconRadiusPx,
  defaultHeroV4PreviewSettings,
  heroV4ContactInfoIconBackgroundPickerFallback,
  heroV4ContactInfoIconColorPickerFallback,
  heroV4ContactInfoRadiusOptions,
  heroV4FormLeadSourceOptions,
  heroV4GalleryBorderWidthOptions,
  heroV4GalleryHeightOptions,
  heroV4GalleryRadiusOptions,
  heroV4BackgroundColorPickerFallback,
  heroV4GalleryTransitions,
  heroV4HeadlineFontSizeOptions,
  heroV4LabelFontStyleOptions,
  isHeroV4LabelFontStyle,
  normalizeHeroV4PreviewSettings,
  resolveHeroV4FormLeadSource,
  resolveHeroV4ShowCta,
  type HeroV4FormLeadSourceId,
  type HeroV4GalleryTransition,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import {
  applyHeroV4Preset,
  bundledHeroV4Presets,
  isHeroV4PresetId,
  listHeroV4Presets,
  normalizeHeroV4PresetLibrary,
  slugifyHeroV4PresetId,
  type HeroV4PresetId,
  type HeroV4PresetLibrary,
} from "@/lib/hero-v4-presets";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadHeroV4PreviewSettings,
  saveHeroV4PreviewSettings,
} from "@/lib/hero-v4-preview-storage";
import { useOptionalOrg } from "@/components/dev/OrgProvider";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import {
  buildServiceAreaLocationHeroV4,
  getServiceAreaLocationDefinition,
} from "@/lib/service-area-location-content";

type HeroV4PreviewContextValue = {
  settings: HeroV4PreviewSettings;
  setSettings: (settings: HeroV4PreviewSettings) => void;
  contentEditingEnabled: boolean;
};

const HeroV4PreviewContext = createContext<HeroV4PreviewContextValue | null>(null);

function resolveHeroV4Fallback(pageSlug: string | undefined): HeroV4PreviewSettings {
  const location = pageSlug ? getServiceAreaLocationDefinition(pageSlug) : undefined;
  if (!location || location.slug === "clark-county-wa") {
    return loadHeroV4PreviewSettings();
  }
  return buildServiceAreaLocationHeroV4(location, loadHeroV4PreviewSettings());
}

export function HeroV4PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: HeroV4PreviewSettings;
  enableContentEditing?: boolean;
}) {
  const playground = useOptionalPlaygroundSections();
  const pageSlug = playground?.activePage.slug;

  const loadGlobal = useCallback(() => resolveHeroV4Fallback(pageSlug), [pageSlug]);
  const afterLoad = useCallback(
    (loaded: HeroV4PreviewSettings) => {
      const location = pageSlug ? getServiceAreaLocationDefinition(pageSlug) : undefined;
      if (!location || location.slug === "clark-county-wa") return loaded;
      return buildServiceAreaLocationHeroV4(location, loaded);
    },
    [pageSlug],
  );

  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "heroV4",
    initialSettings,
    defaultSettings: defaultHeroV4PreviewSettings,
    loadGlobal,
    saveGlobal: saveHeroV4PreviewSettings,
    normalize: normalizeHeroV4PreviewSettings,
    afterLoad,
  });

  return (
    <HeroV4PreviewContext.Provider
      value={{ settings, setSettings, contentEditingEnabled: enableContentEditing }}
    >
      {children}
    </HeroV4PreviewContext.Provider>
  );
}

export function useHeroV4Preview() {
  return useContext(HeroV4PreviewContext);
}

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const numberInputClassName =
  "w-16 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const textInputClassName =
  "w-28 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const checkboxClassName = "accent-accent-purple";

function applyLibraryPayload(library: unknown): HeroV4PresetLibrary | null {
  if (!library || typeof library !== "object") return null;
  return normalizeHeroV4PresetLibrary(library);
}

function defaultOverwritePresetId(
  library: HeroV4PresetLibrary,
  presetId: HeroV4PresetId | "",
  orgId: string | undefined,
): string {
  const entries = listHeroV4Presets(library);
  if (presetId && entries.some((entry) => entry.id === presetId)) return presetId;
  if (orgId && entries.some((entry) => entry.id === orgId)) return orgId;
  return entries[0]?.id ?? "";
}

export function HeroV4PreviewControls() {
  const context = useHeroV4Preview();
  const org = useOptionalOrg();
  const [presetId, setPresetId] = useState<HeroV4PresetId | "">("");
  const [library, setLibrary] = useState(bundledHeroV4Presets);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hero-v4-presets")
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

  const settings = normalizeHeroV4PreviewSettings(context.settings);
  const presets = listHeroV4Presets(library);
  const update = (patch: Partial<HeroV4PreviewSettings>) => {
    context.setSettings(normalizeHeroV4PreviewSettings({ ...settings, ...patch }));
  };

  async function savePreset(input: { id?: string; label?: string }) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/hero-v4-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, settings }),
      });
      if (!response.ok) throw new Error("save failed");
      const data = (await response.json()) as { id?: unknown; library?: unknown };
      const next = applyLibraryPayload(data.library);
      if (next) setLibrary(next);
      if (typeof data.id === "string" && isHeroV4PresetId(data.id)) {
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
            if (!isHeroV4PresetId(nextId)) {
              setPresetId("");
              return;
            }
            setPresetId(nextId);
            context.setSettings(applyHeroV4Preset(nextId, library));
          }}
          className={selectClassName}
          aria-label="Apply hero copy starter"
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
        aria-label="Save current hero as a preset"
      >
        {saveState === "saving"
          ? "Saving"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Retry"
              : "Save preset"}
      </button>
      <HeroV4SavePresetDialog
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
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Form</span>
        <input
          type="checkbox"
          checked={settings.showForm}
          onChange={(event) =>
            update({
              showForm: event.target.checked,
              showGallery: event.target.checked ? false : settings.showGallery,
            })
          }
          className={checkboxClassName}
          aria-label="Show hero contact form"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">CTA</span>
        <input
          type="checkbox"
          checked={resolveHeroV4ShowCta(settings)}
          onChange={(event) => update({ showCta: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show quote button"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Gallery</span>
        <input
          type="checkbox"
          checked={Boolean(settings.showGallery)}
          onChange={(event) =>
            update({
              showGallery: event.target.checked,
              showForm: event.target.checked ? false : settings.showForm,
            })
          }
          className={checkboxClassName}
          aria-label="Show hero gallery"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Phone</span>
        <input
          type="checkbox"
          checked={settings.showPhoneCta}
          onChange={(event) => update({ showPhoneCta: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show hero phone button"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Info
        </span>
        <input
          type="checkbox"
          checked={Boolean(settings.showContactInfo)}
          onChange={(event) =>
            update({
              showContactInfo: event.target.checked,
              contactInfoItems:
                event.target.checked && !(settings.contactInfoItems ?? []).length
                  ? defaultHeroV4ContactInfoItems
                  : settings.contactInfoItems,
            })
          }
          className={checkboxClassName}
          aria-label="Show hero contact info"
        />
      </label>
      {settings.showContactInfo ? (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Icon</span>
            <input
              type="color"
              value={settings.contactInfoIconColor ?? heroV4ContactInfoIconColorPickerFallback}
              onChange={(event) => update({ contactInfoIconColor: event.target.value })}
              className={`${colorInputClassName}${settings.contactInfoIconColor ? "" : " opacity-40"}`}
              aria-label="Contact info icon color"
            />
            {settings.contactInfoIconColor ? (
              <button
                type="button"
                onClick={() => update({ contactInfoIconColor: undefined })}
                className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
              >
                Default
              </button>
            ) : null}
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Fill</span>
            <input
              type="color"
              value={
                settings.contactInfoIconBackground ?? heroV4ContactInfoIconBackgroundPickerFallback
              }
              onChange={(event) => update({ contactInfoIconBackground: event.target.value })}
              className={`${colorInputClassName}${settings.contactInfoIconBackground ? "" : " opacity-40"}`}
              aria-label="Contact info icon background color"
            />
            {settings.contactInfoIconBackground ? (
              <button
                type="button"
                onClick={() => update({ contactInfoIconBackground: undefined })}
                className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
              >
                Default
              </button>
            ) : null}
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
            <select
              value={settings.contactInfoIconRadiusPx ?? defaultHeroV4ContactInfoIconRadiusPx}
              onChange={(event) =>
                update({ contactInfoIconRadiusPx: Number(event.target.value) })
              }
              className={selectClassName}
              aria-label="Contact info icon corner radius"
            >
              {heroV4ContactInfoRadiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {typeof settings.contactInfoIconRadiusPx === "number" ? (
              <button
                type="button"
                onClick={() => update({ contactInfoIconRadiusPx: undefined })}
                className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
              >
                Default
              </button>
            ) : null}
          </label>
        </>
      ) : null}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Bullets</span>
        <input
          type="checkbox"
          checked={settings.showBullets}
          onChange={(event) => update({ showBullets: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show hero bullet list"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
          Breadcrumb
        </span>
        <input
          type="checkbox"
          checked={settings.showBreadcrumbs}
          onChange={(event) => update({ showBreadcrumbs: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show hero breadcrumbs"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Pills</span>
        <input
          type="checkbox"
          checked={settings.showServicePills}
          onChange={(event) => update({ showServicePills: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show hero pills"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Style</span>
        <select
          value={settings.labelFontStyle ?? "normal"}
          onChange={(event) => {
            if (!isHeroV4LabelFontStyle(event.target.value)) return;
            update({ labelFontStyle: event.target.value });
          }}
          className={selectClassName}
          aria-label="Hero eyebrow, headline, and button font style"
        >
          {heroV4LabelFontStyleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">H1 size</span>
        <select
          value={settings.headlineFontSizePx ?? ""}
          onChange={(event) => {
            const raw = event.target.value;
            update({
              headlineFontSizePx: raw ? Number(raw) : undefined,
            });
          }}
          className={selectClassName}
          aria-label="Hero headline font size"
        >
          <option value="">Responsive</option>
          {heroV4HeadlineFontSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">H1 bold</span>
        <input
          type="checkbox"
          checked={settings.headlineBold === true}
          onChange={(event) => update({ headlineBold: event.target.checked })}
          className={checkboxClassName}
          aria-label="Bold hero headline"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">H1 italic</span>
        <input
          type="checkbox"
          checked={settings.headlineFirstLineItalic === true}
          onChange={(event) => update({ headlineFirstLineItalic: event.target.checked })}
          className={checkboxClassName}
          aria-label="Italic hero headline"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">H1 caps</span>
        <input
          type="checkbox"
          checked={settings.headlineUppercase === true}
          onChange={(event) => update({ headlineUppercase: event.target.checked })}
          className={checkboxClassName}
          aria-label="Uppercase hero headline"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
        <input
          type="color"
          value={settings.backgroundColor ?? heroV4BackgroundColorPickerFallback}
          onChange={(event) => update({ backgroundColor: event.target.value })}
          className={`${colorInputClassName}${settings.backgroundColor ? "" : " opacity-40"}`}
          aria-label="Hero background color"
        />
        {settings.backgroundColor ? (
          <button
            type="button"
            onClick={() => update({ backgroundColor: undefined })}
            className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
          >
            Default
          </button>
        ) : null}
      </label>
      {settings.showForm ? (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Lead src</span>
            <select
              value={settings.formLeadSource ?? defaultHeroV4PreviewSettings.formLeadSource}
              onChange={(event) =>
                update({ formLeadSource: event.target.value as HeroV4FormLeadSourceId })
              }
              className={selectClassName}
              aria-label="Foundation lead source for hero form"
              title={resolveHeroV4FormLeadSource(settings.formLeadSource)}
            >
              {heroV4FormLeadSourceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Submit
            </span>
            <input
              type="text"
              value={settings.formSubmitText ?? defaultContactButtonSettings.submitText}
              onChange={(event) => update({ formSubmitText: event.target.value })}
              className={textInputClassName}
              aria-label="Hero form submit button text"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Btn</span>
            <input
              type="color"
              value={
                settings.formButtonBackground ?? defaultContactButtonSettings.buttonBackground
              }
              onChange={(event) => update({ formButtonBackground: event.target.value })}
              className={`${colorInputClassName}${settings.formButtonBackground ? "" : " opacity-40"}`}
              aria-label="Hero form submit button background"
            />
            {settings.formButtonBackground ? (
              <button
                type="button"
                onClick={() => update({ formButtonBackground: undefined })}
                className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
              >
                Default
              </button>
            ) : null}
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Btn text
            </span>
            <input
              type="color"
              value={settings.formButtonTextColor ?? defaultContactButtonSettings.buttonTextColor}
              onChange={(event) => update({ formButtonTextColor: event.target.value })}
              className={`${colorInputClassName}${settings.formButtonTextColor ? "" : " opacity-40"}`}
              aria-label="Hero form submit button text color"
            />
            {settings.formButtonTextColor ? (
              <button
                type="button"
                onClick={() => update({ formButtonTextColor: undefined })}
                className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
              >
                Default
              </button>
            ) : null}
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Btn radius
            </span>
            <select
              value={settings.formButtonRadiusPx ?? defaultContactButtonSettings.buttonRadiusPx}
              onChange={(event) => update({ formButtonRadiusPx: Number(event.target.value) })}
              className={selectClassName}
              aria-label="Hero form submit button border radius"
            >
              {contactButtonBorderRadiusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}px
                </option>
              ))}
            </select>
            {typeof settings.formButtonRadiusPx === "number" ? (
              <button
                type="button"
                onClick={() => update({ formButtonRadiusPx: undefined })}
                className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
              >
                Default
              </button>
            ) : null}
          </label>
          <HeroV4FormFieldsControls />
        </>
      ) : null}
      {settings.showGallery ? (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Height</span>
            <select
              value={settings.galleryHeightPx}
              onChange={(event) => update({ galleryHeightPx: Number(event.target.value) })}
              className={selectClassName}
              aria-label="Gallery height"
            >
              {heroV4GalleryHeightOptions.map((height) => (
                <option key={height} value={height}>
                  {height}px
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Fill</span>
            <input
              type="color"
              value={settings.galleryBackground ?? "#000000"}
              onChange={(event) => update({ galleryBackground: event.target.value })}
              className={colorInputClassName}
              aria-label="Gallery background color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
            <select
              value={settings.galleryRadiusPx ?? 20}
              onChange={(event) => update({ galleryRadiusPx: Number(event.target.value) })}
              className={selectClassName}
              aria-label="Gallery corner radius"
            >
              {heroV4GalleryRadiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Border</span>
            <input
              type="color"
              value={settings.galleryBorderColor || "#000000"}
              onChange={(event) => update({ galleryBorderColor: event.target.value })}
              className={colorInputClassName}
              aria-label="Gallery border color"
            />
          </label>
          {settings.galleryBorderColor ? (
            <button
              type="button"
              onClick={() => update({ galleryBorderColor: "" })}
              className="font-mono text-xs tracking-wide text-accent-purple/80 uppercase hover:text-accent-purple"
            >
              Default
            </button>
          ) : null}
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Weight</span>
            <select
              value={settings.galleryBorderWidthPx ?? 1}
              onChange={(event) => update({ galleryBorderWidthPx: Number(event.target.value) })}
              className={selectClassName}
              aria-label="Gallery border thickness"
            >
              {heroV4GalleryBorderWidthOptions.map((width) => (
                <option key={width} value={width}>
                  {width}px
                </option>
              ))}
            </select>
          </label>
          {(settings.gallerySlides ?? []).length > 1 ? (
            <>
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Timer</span>
                <input
                  type="number"
                  min={2}
                  max={60}
                  step={1}
                  value={Math.round((settings.galleryIntervalMs ?? 5000) / 1000)}
                  onChange={(event) => {
                    const seconds = Number(event.target.value);
                    if (Number.isNaN(seconds)) return;
                    update({ galleryIntervalMs: Math.min(60, Math.max(2, seconds)) * 1000 });
                  }}
                  className={numberInputClassName}
                  aria-label="Gallery slide timer in seconds"
                />
                <span className="font-mono text-[0.65rem] text-accent-purple">sec</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">
                  Transition
                </span>
                <select
                  value={settings.galleryTransition ?? "fade"}
                  onChange={(event) =>
                    update({ galleryTransition: event.target.value as HeroV4GalleryTransition })
                  }
                  className={selectClassName}
                  aria-label="Gallery slide transition"
                >
                  {heroV4GalleryTransitions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const saveFieldClassName =
  "w-full rounded border border-white/10 bg-[#0d0d14] px-3 py-2.5 font-mono text-sm text-white placeholder:text-white/30 focus:border-accent-purple/50 focus:outline-none";

function HeroV4SavePresetDialog({
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
  library: HeroV4PresetLibrary;
  defaultExistingId: string;
  onClose: () => void;
  onSave: (input: { id?: string; label?: string }) => void;
}) {
  const presets = listHeroV4Presets(library);
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

  const newId = slugifyHeroV4PresetId(newName);
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
        aria-labelledby="hero-v4-save-preset-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2
              id="hero-v4-save-preset-title"
              className="font-mono text-sm tracking-[0.2em] text-white/50 uppercase"
            >
              Save preset
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Keep this hero as-is. Choosing a starter here does not apply it.
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
                name="hero-v4-save-mode"
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
                name="hero-v4-save-mode"
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
                  placeholder="Langham gallery"
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
              Replaces the saved starter. This site stays on your current hero until you apply a
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
