"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultServicesIconsV2PreviewSettings,
  servicesIconsV2BorderRadiusOptions,
  servicesIconsV2GradientDirections,
  type ServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview";
import type { SiteIconName } from "@/lib/site-icons";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import {
  loadServicesIconsV2PreviewSettings,
  normalizeServicesIconsV2PreviewSettings,
  saveServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview-storage";

type ServicesIconsV2PreviewContextValue = {
  settings: ServicesIconsV2PreviewSettings;
  setSettings: (settings: ServicesIconsV2PreviewSettings) => void;
  /** True only on /playground — card icon/label/heading/CTA editors. */
  contentEditingEnabled: boolean;
  getServiceIcon: (serviceId: string, fallback: SiteIconName) => SiteIconName;
  setServiceIcon: (serviceId: string, iconName: SiteIconName) => void;
  getServiceLabel: (serviceId: string, fallback: string) => string;
  setServiceLabel: (serviceId: string, label: string) => void;
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
  initialSettings?: ServicesIconsV2PreviewSettings;
  /** Playground-only — enables per-card editors and persists to localStorage. */
  enableContentEditing?: boolean;
};

export function ServicesIconsV2PreviewProvider({
  children,
  initialSettings,
  enableContentEditing = false,
}: ServicesIconsV2PreviewProviderProps) {
  const [settings, setSettingsState] = useState<ServicesIconsV2PreviewSettings>(() =>
    initialSettings
      ? normalizeServicesIconsV2PreviewSettings(initialSettings)
      : defaultServicesIconsV2PreviewSettings,
  );

  useEffect(() => {
    if (initialSettings !== undefined) return;
    setSettingsState(loadServicesIconsV2PreviewSettings());
  }, [initialSettings]);

  const setSettings = useCallback(
    (next: ServicesIconsV2PreviewSettings) => {
      if (!enableContentEditing) return;
      const normalized = normalizeServicesIconsV2PreviewSettings(next);
      setSettingsState(normalized);
      saveServicesIconsV2PreviewSettings(normalized);
    },
    [enableContentEditing],
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
      setSettings({
        ...settings,
        serviceLabels: {
          ...settings.serviceLabels,
          [serviceId]: trimmed,
        },
      });
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

export function ServicesIconsV2PreviewControls() {
  const context = useServicesIconsV2Preview();
  if (!context?.contentEditingEnabled) return null;

  const update = (patch: Partial<ServicesIconsV2PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
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
          aria-label="Services icons v2 icon circle color"
        />
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
