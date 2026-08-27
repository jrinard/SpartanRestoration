"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  defaultServiceAreaV2PreviewSettings,
  getServiceAreaV2ThemeDefaults,
  type ServiceAreaV2BackgroundMode,
  type ServiceAreaV2PreviewSettings,
  type ServiceAreaV2SectionTheme,
} from "@/lib/service-area-v2-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { siteLayoutWidthOptions } from "@/lib/site-layout";
import { previewGradientDirections } from "@/lib/preview-gradient";
import {
  loadServiceAreaV2PreviewSettings,
  normalizeServiceAreaV2PreviewSettings,
  saveServiceAreaV2PreviewSettings,
} from "@/lib/service-area-v2-preview-storage";

type ServiceAreaV2PreviewContextValue = {
  settings: ServiceAreaV2PreviewSettings;
  setSettings: (settings: ServiceAreaV2PreviewSettings) => void;
};

const ServiceAreaV2PreviewContext = createContext<ServiceAreaV2PreviewContextValue | null>(null);

export function ServiceAreaV2PreviewProvider({
  children,
  instanceId,
  initialSettings,
}: {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ServiceAreaV2PreviewSettings;
}) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "serviceAreaV2",
    initialSettings,
    defaultSettings: defaultServiceAreaV2PreviewSettings,
    loadGlobal: loadServiceAreaV2PreviewSettings,
    saveGlobal: saveServiceAreaV2PreviewSettings,
    normalize: normalizeServiceAreaV2PreviewSettings,
  });

  return (
    <ServiceAreaV2PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </ServiceAreaV2PreviewContext.Provider>
  );
}

export function useServiceAreaV2Preview() {
  return useContext(ServiceAreaV2PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function ServiceAreaV2PreviewControls() {
  const context = useServiceAreaV2Preview();
  if (!context) return null;

  const { settings, setSettings } = context;

  const update = (patch: Partial<ServiceAreaV2PreviewSettings>) => {
    setSettings(normalizeServiceAreaV2PreviewSettings({ ...settings, ...patch }));
  };

  const applyTheme = (theme: ServiceAreaV2SectionTheme) => {
    const themeDefaults = getServiceAreaV2ThemeDefaults(theme);
    update({
      theme,
      solidBackground: themeDefaults.solidBackground,
      cardBackgroundColor: themeDefaults.cardBackgroundColor,
      cardHoverBackgroundColor: themeDefaults.cardHoverBackgroundColor,
      cardTextColor: themeDefaults.cardTextColor,
      cardMutedColor: themeDefaults.cardMutedColor,
      linkColor: themeDefaults.linkColor,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs text-accent-purple/80">Theme</span>
      {(["light", "dark"] as const).map((theme) => (
        <button
          key={theme}
          type="button"
          className={buttonClassName}
          data-active={settings.theme === theme ? "true" : undefined}
          onClick={() => applyTheme(theme)}
        >
          {theme}
        </button>
      ))}

      <span className="font-mono text-xs text-accent-purple/80">Width</span>
      <select
        value={settings.layoutWidth}
        onChange={(event) => update({ layoutWidth: event.target.value as typeof settings.layoutWidth })}
        className={buttonClassName}
      >
        {siteLayoutWidthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span className="font-mono text-xs text-accent-purple/80">BG</span>
      <select
        value={settings.backgroundMode}
        onChange={(event) =>
          update({ backgroundMode: event.target.value as ServiceAreaV2BackgroundMode })
        }
        className={buttonClassName}
      >
        <option value="solid">Solid</option>
        <option value="gradient">Gradient</option>
      </select>

      <input
        type="color"
        value={settings.solidBackground}
        onChange={(event) => update({ solidBackground: event.target.value })}
        aria-label="Section background"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Accent</span>
      <input
        type="color"
        value={settings.accentColor}
        onChange={(event) => update({ accentColor: event.target.value })}
        aria-label="Accent color"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Link</span>
      <input
        type="color"
        value={settings.linkColor}
        onChange={(event) => update({ linkColor: event.target.value })}
        aria-label="Link color"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Card</span>
      <input
        type="color"
        value={settings.cardBackgroundColor}
        onChange={(event) => update({ cardBackgroundColor: event.target.value })}
        aria-label="Card background"
        className={colorInputClassName}
      />

      <span className="font-mono text-xs text-accent-purple/80">Card radius</span>
      <input
        type="range"
        min={0}
        max={48}
        step={4}
        value={settings.cardBorderRadiusPx}
        onChange={(event) => update({ cardBorderRadiusPx: Number(event.target.value) })}
        aria-label="Card border radius"
        className="h-1.5 w-20 cursor-pointer accent-accent-purple"
      />

      {settings.backgroundMode === "gradient" ? (
        <>
          <input
            type="color"
            value={settings.background.from}
            onChange={(event) =>
              update({ background: { ...settings.background, from: event.target.value } })
            }
            aria-label="Gradient from"
            className={colorInputClassName}
          />
          <input
            type="color"
            value={settings.background.to}
            onChange={(event) =>
              update({ background: { ...settings.background, to: event.target.value } })
            }
            aria-label="Gradient to"
            className={colorInputClassName}
          />
          <select
            value={settings.background.direction}
            onChange={(event) =>
              update({
                background: {
                  ...settings.background,
                  direction: event.target.value as typeof settings.background.direction,
                },
              })
            }
            className={buttonClassName}
          >
            {previewGradientDirections.map((direction) => (
              <option key={direction.value} value={direction.value}>
                {direction.label}
              </option>
            ))}
          </select>
        </>
      ) : null}
    </div>
  );
}
