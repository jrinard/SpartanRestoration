"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import {
  defaultHeroV4PreviewSettings,
  formatHeroV4Bullets,
  heroV4FormLeadSourceOptions,
  normalizeHeroV4PreviewSettings,
  parseHeroV4Bullets,
  resolveHeroV4FormLeadSource,
  type HeroV4FormLeadSourceId,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
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
}: {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: HeroV4PreviewSettings;
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
    <HeroV4PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </HeroV4PreviewContext.Provider>
  );
}

export function useHeroV4Preview() {
  return useContext(HeroV4PreviewContext);
}

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const textInputClassName =
  "max-w-[12rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const textAreaClassName =
  "min-h-[4.5rem] max-w-[16rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const checkboxClassName = "accent-accent-purple";

export function HeroV4PreviewControls() {
  const context = useHeroV4Preview();
  if (!context) return null;

  const settings = normalizeHeroV4PreviewSettings(context.settings);
  const setSettings = (next: HeroV4PreviewSettings) => {
    context.setSettings(normalizeHeroV4PreviewSettings(next));
  };

  const update = (patch: Partial<HeroV4PreviewSettings>) => {
    setSettings({ ...settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Form</span>
        <input
          type="checkbox"
          checked={settings.showForm}
          onChange={(event) => update({ showForm: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show hero contact form"
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
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Crumbs</span>
        <input
          type="checkbox"
          checked={settings.showBreadcrumbs}
          onChange={(event) => update({ showBreadcrumbs: event.target.checked })}
          className={checkboxClassName}
          aria-label="Show hero breadcrumbs"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Eyebrow</span>
        <input
          type="text"
          value={settings.eyebrow}
          onChange={(event) => update({ eyebrow: event.target.value })}
          className={textInputClassName}
          aria-label="Hero eyebrow text"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="text"
          value={settings.headline}
          onChange={(event) => update({ headline: event.target.value })}
          className={textInputClassName}
          aria-label="Hero headline text"
        />
      </label>
      <label className="flex items-start gap-2">
        <span className="pt-1 font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <textarea
          value={settings.body}
          onChange={(event) => update({ body: event.target.value })}
          className={textAreaClassName}
          aria-label="Hero body text"
          rows={3}
        />
      </label>
      {settings.showBullets ? (
        <label className="flex items-start gap-2">
          <span className="pt-1 font-mono text-xs tracking-wide text-accent-purple uppercase">Bullets</span>
          <textarea
            value={formatHeroV4Bullets(settings.bullets)}
            onChange={(event) => update({ bullets: parseHeroV4Bullets(event.target.value) })}
            className={textAreaClassName}
            aria-label="Hero bullet list"
            rows={4}
            placeholder="One bullet per line"
          />
        </label>
      ) : null}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">CTA</span>
        <input
          type="text"
          value={settings.primaryCtaLabel}
          onChange={(event) => update({ primaryCtaLabel: event.target.value })}
          className={textInputClassName}
          aria-label="Hero primary button label"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">CTA URL</span>
        <input
          type="text"
          value={settings.primaryCtaHref}
          onChange={(event) => update({ primaryCtaHref: event.target.value })}
          className={textInputClassName}
          aria-label="Hero primary button link"
        />
      </label>
      {settings.showForm ? (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Form title</span>
            <input
              type="text"
              value={settings.formTitle}
              onChange={(event) => update({ formTitle: event.target.value })}
              className={textInputClassName}
              aria-label="Hero form title"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Form sub</span>
            <input
              type="text"
              value={settings.formSubtext}
              onChange={(event) => update({ formSubtext: event.target.value })}
              className={textInputClassName}
              aria-label="Hero form subtext"
            />
          </label>
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
        </>
      ) : null}
    </div>
  );
}
