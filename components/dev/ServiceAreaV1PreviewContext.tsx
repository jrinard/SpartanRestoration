"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import {
  defaultServiceAreaV1PreviewSettings,
  serviceAreaV1BackgroundModes,
  serviceAreaV1CardBorderRadiusOptions,
  serviceAreaV1SizeOptions,
  type ServiceAreaV1BackgroundMode,
  resolveServiceAreaV1GraphSrc,
  type ServiceAreaV1PreviewSettings,
  type ServiceAreaV1Size,
} from "@/lib/service-area-preview";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadServiceAreaV1PreviewSettings,
  normalizeServiceAreaV1PreviewSettings,
  saveServiceAreaV1PreviewSettings,
} from "@/lib/service-area-preview-storage";

type ServiceAreaV1PreviewContextValue = {
  settings: ServiceAreaV1PreviewSettings;
  setSettings: (settings: ServiceAreaV1PreviewSettings) => void;
  contentEditingEnabled: boolean;
  getSectionHeading: (fallback: string) => string;
  setSectionHeading: (heading: string) => void;
  getLocationLabel: (locationId: string, fallback: string) => string;
  setLocationLabel: (locationId: string, label: string) => void;
  getGraphImageSrc: () => string | null;
  setGraphImage: (src: string) => void;
  clearGraphImage: () => void;
};

const ServiceAreaV1PreviewContext = createContext<ServiceAreaV1PreviewContextValue | null>(null);

type ServiceAreaV1PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ServiceAreaV1PreviewSettings;
  enableContentEditing?: boolean;
};

export function ServiceAreaV1PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: ServiceAreaV1PreviewProviderProps) {
  const { settings, setSettings: persistSettings } = useInstancePreviewSettings({
    instanceId,
    field: "serviceAreaV1",
    initialSettings,
    defaultSettings: defaultServiceAreaV1PreviewSettings,
    loadGlobal: loadServiceAreaV1PreviewSettings,
    saveGlobal: saveServiceAreaV1PreviewSettings,
    normalize: normalizeServiceAreaV1PreviewSettings,
  });

  const setSettings = useCallback(
    (next: ServiceAreaV1PreviewSettings) => {
      persistSettings(next);
    },
    [persistSettings],
  );

  const getSectionHeading = useCallback(
    (fallback: string): string => {
      return settings.sectionHeading ?? fallback;
    },
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

  const getLocationLabel = useCallback(
    (locationId: string, fallback: string): string => {
      return settings.locationLabels[locationId] ?? fallback;
    },
    [settings.locationLabels],
  );

  const setLocationLabel = useCallback(
    (locationId: string, label: string) => {
      if (!enableContentEditing) return;
      const trimmed = label.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        locationLabels: {
          ...settings.locationLabels,
          [locationId]: trimmed,
        },
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const getGraphImageSrc = useCallback((): string | null => {
    return resolveServiceAreaV1GraphSrc(settings);
  }, [settings]);

  const setGraphImage = useCallback(
    (src: string) => {
      if (!enableContentEditing) return;
      const trimmed = src.trim();
      if (!trimmed) return;
      setSettings({
        ...settings,
        graphImageSrc: trimmed,
      });
    },
    [enableContentEditing, settings, setSettings],
  );

  const clearGraphImage = useCallback(() => {
    if (!enableContentEditing) return;
    setSettings({
      ...settings,
      graphImageSrc: "",
    });
  }, [enableContentEditing, settings, setSettings]);

  return (
    <ServiceAreaV1PreviewContext.Provider
      value={{
        settings,
        setSettings,
        contentEditingEnabled: enableContentEditing,
        getSectionHeading,
        setSectionHeading,
        getLocationLabel,
        setLocationLabel,
        getGraphImageSrc,
        setGraphImage,
        clearGraphImage,
      }}
    >
      {children}
    </ServiceAreaV1PreviewContext.Provider>
  );
}

export function useServiceAreaV1Preview() {
  return useContext(ServiceAreaV1PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const rangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

export function ServiceAreaV1PreviewControls() {
  const context = useServiceAreaV1Preview();
  if (!context) return null;

  const update = (patch: Partial<ServiceAreaV1PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  const isGradient = context.settings.backgroundMode === "gradient";

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
        <select
          value={context.settings.layoutWidth}
          onChange={(event) => update({ layoutWidth: event.target.value as SiteLayoutWidth })}
          className={selectClassName}
          aria-label="Service area layout width"
        >
          {siteLayoutWidthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Size</span>
        <select
          value={context.settings.size}
          onChange={(event) => update({ size: event.target.value as ServiceAreaV1Size })}
          className={selectClassName}
          aria-label="Service area icon and text size"
        >
          {serviceAreaV1SizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Fill</span>
        <select
          value={context.settings.backgroundMode}
          onChange={(event) =>
            update({ backgroundMode: event.target.value as ServiceAreaV1BackgroundMode })
          }
          className={selectClassName}
          aria-label="Service area background mode"
        >
          {serviceAreaV1BackgroundModes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {!isGradient ? (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
          <input
            type="color"
            value={context.settings.backgroundColor}
            onChange={(event) => update({ backgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Service area solid background color"
          />
        </label>
      ) : (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">From</span>
            <input
              type="color"
              value={context.settings.backgroundGradientFrom}
              onChange={(event) => update({ backgroundGradientFrom: event.target.value })}
              className={colorInputClassName}
              aria-label="Service area gradient start color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">To</span>
            <input
              type="color"
              value={context.settings.backgroundGradientTo}
              onChange={(event) => update({ backgroundGradientTo: event.target.value })}
              className={colorInputClassName}
              aria-label="Service area gradient end color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Angle</span>
            <input
              type="range"
              min={0}
              max={360}
              value={context.settings.backgroundGradientAngle}
              onChange={(event) =>
                update({ backgroundGradientAngle: Number(event.target.value) })
              }
              className={rangeClassName}
              aria-label="Service area gradient angle"
            />
            <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
              {context.settings.backgroundGradientAngle}°
            </span>
          </label>
        </>
      )}

      {context.settings.layoutWidth === "contained" && (
        <label className="flex items-center gap-2">
          <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Outer</span>
          <input
            type="color"
            value={context.settings.outerBackgroundColor}
            onChange={(event) => update({ outerBackgroundColor: event.target.value })}
            className={colorInputClassName}
            aria-label="Service area outer background color"
          />
        </label>
      )}

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Radius</span>
        <select
          value={context.settings.cardBorderRadiusPx}
          onChange={(event) => update({ cardBorderRadiusPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Service area card border radius"
        >
          {serviceAreaV1CardBorderRadiusOptions.map((radius) => (
            <option key={radius} value={radius}>
              {radius}px
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Heading</span>
        <input
          type="color"
          value={context.settings.headingColor}
          onChange={(event) => update({ headingColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Service area heading color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Pin</span>
        <input
          type="color"
          value={context.settings.iconColor}
          onChange={(event) => update({ iconColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Service area pin icon color"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Locations</span>
        <input
          type="color"
          value={context.settings.locationTextColor}
          onChange={(event) => update({ locationTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Service area location text color"
        />
      </label>
    </div>
  );
}
