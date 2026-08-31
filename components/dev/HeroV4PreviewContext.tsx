"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  defaultHeroV4PreviewSettings,
  heroV4FormLeadSourceOptions,
  heroV4GalleryHeightOptions,
  heroV4GalleryRadiusOptions,
  heroV4GalleryTransitions,
  normalizeHeroV4PreviewSettings,
  resolveHeroV4FormLeadSource,
  resolveHeroV4ShowCta,
  type HeroV4FormLeadSourceId,
  type HeroV4GalleryTransition,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import {
  applyHeroV4Preset,
  defaultHeroV4PresetId,
  heroV4Presets,
  type HeroV4PresetId,
} from "@/lib/hero-v4-presets";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadHeroV4PreviewSettings,
  saveHeroV4PreviewSettings,
} from "@/lib/hero-v4-preview-storage";
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

const checkboxClassName = "accent-accent-purple";

export function HeroV4PreviewControls() {
  const context = useHeroV4Preview();
  const [presetId, setPresetId] = useState<HeroV4PresetId>(defaultHeroV4PresetId);
  if (!context) return null;

  const settings = normalizeHeroV4PreviewSettings(context.settings);
  const update = (patch: Partial<HeroV4PreviewSettings>) => {
    context.setSettings(normalizeHeroV4PreviewSettings({ ...settings, ...patch }));
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Preset</span>
        <select
          value={presetId}
          onChange={(event) => {
            const nextId = event.target.value as HeroV4PresetId;
            setPresetId(nextId);
            context.setSettings(applyHeroV4Preset(nextId));
          }}
          className={selectClassName}
          aria-label="Apply hero copy starter"
        >
          {heroV4Presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
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
      {settings.showForm ? (
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
    </div>
  );
}
