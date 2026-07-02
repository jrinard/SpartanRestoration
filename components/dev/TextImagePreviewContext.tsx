"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  defaultTextImagePreviewSettings,
  getTextImageColorsForTheme,
  textImageEntranceSpeedOptions,
  textImageSectionThemes,
  type TextImagePreviewSettings,
  type TextImageSectionTheme,
} from "@/lib/text-image-preview";
import {
  loadTextImageInstanceSettings,
  saveTextImageInstanceSettings,
} from "@/lib/content-instance-storage";
import {
  loadTextImagePreviewSettings,
  normalizeTextImagePreviewSettings,
  saveTextImagePreviewSettings,
} from "@/lib/text-image-preview-storage";

type TextImagePreviewContextValue = {
  settings: TextImagePreviewSettings;
  setSettings: (settings: TextImagePreviewSettings) => void;
};

const TextImagePreviewContext = createContext<TextImagePreviewContextValue | null>(null);

type TextImagePreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TextImagePreviewSettings;
};

export function TextImagePreviewProvider({
  children,
  instanceId,
  initialSettings,
}: TextImagePreviewProviderProps) {
  const lockedToPublished = initialSettings !== undefined;

  const [settings, setSettingsState] = useState<TextImagePreviewSettings>(() => {
    if (initialSettings) {
      return normalizeTextImagePreviewSettings(initialSettings);
    }
    if (instanceId) {
      return loadTextImageInstanceSettings(instanceId) ?? defaultTextImagePreviewSettings;
    }
    return defaultTextImagePreviewSettings;
  });

  useEffect(() => {
    if (lockedToPublished) return;
    if (instanceId) {
      setSettingsState(
        loadTextImageInstanceSettings(instanceId) ?? loadTextImagePreviewSettings(),
      );
      return;
    }
    setSettingsState(loadTextImagePreviewSettings());
  }, [instanceId, lockedToPublished]);

  const setSettings = useCallback(
    (next: TextImagePreviewSettings) => {
      if (lockedToPublished) return;
      const normalized = normalizeTextImagePreviewSettings(next);
      setSettingsState(normalized);
      if (instanceId) {
        saveTextImageInstanceSettings(instanceId, normalized);
        return;
      }
      saveTextImagePreviewSettings(normalized);
    },
    [instanceId, lockedToPublished],
  );

  return (
    <TextImagePreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </TextImagePreviewContext.Provider>
  );
}

export function useTextImagePreview() {
  return useContext(TextImagePreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function TextImagePreviewControls() {
  const context = useTextImagePreview();
  if (!context) return null;

  const update = (patch: Partial<TextImagePreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={context.settings.theme}
          onChange={(event) => {
            const theme = event.target.value as TextImageSectionTheme;
            update({
              theme,
              ...getTextImageColorsForTheme(theme),
            });
          }}
          className={selectClassName}
          aria-label="Text and image section theme"
        >
          {textImageSectionThemes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 backdrop-blur-sm">
        <input
          type="checkbox"
          checked={context.settings.layoutInverted}
          onChange={(event) => update({ layoutInverted: event.target.checked })}
          className="h-3.5 w-3.5 accent-accent-purple"
          aria-label="Invert text and image layout"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Invert</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
        <input
          type="color"
          value={
            context.settings.backgroundColor.startsWith("#")
              ? context.settings.backgroundColor
              : "#ffffff"
          }
          onChange={(event) => update({ backgroundColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image section background color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Eyebrow</span>
        <input
          type="color"
          value={
            context.settings.eyebrowColor.startsWith("#")
              ? context.settings.eyebrowColor
              : "#56616A"
          }
          onChange={(event) => update({ eyebrowColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image eyebrow text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="color"
          value={
            context.settings.headlineColor.startsWith("#")
              ? context.settings.headlineColor
              : "#000000"
          }
          onChange={(event) => update({ headlineColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image headline text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <input
          type="color"
          value={
            context.settings.bodyColor.startsWith("#") ? context.settings.bodyColor : "#333333"
          }
          onChange={(event) => update({ bodyColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image body text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Sidebar</span>
        <input
          type="color"
          value={
            context.settings.sidebarTextColor.startsWith("#")
              ? context.settings.sidebarTextColor
              : "#333333"
          }
          onChange={(event) => update({ sidebarTextColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Text and image sidebar text color"
        />
      </label>
      <ButtonPreviewControls target="textImage" />
      <label className="flex cursor-pointer items-center gap-1.5 rounded border border-accent-purple/40 bg-background/90 px-2 py-1.5 backdrop-blur-sm">
        <input
          type="checkbox"
          checked={context.settings.entranceAnimationEnabled}
          onChange={(event) => update({ entranceAnimationEnabled: event.target.checked })}
          className="h-3.5 w-3.5 accent-accent-purple"
          aria-label="Enable text and image entrance animation"
        />
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Anim</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Anim Spd</span>
        <select
          value={context.settings.entranceAnimationSpeedMs}
          onChange={(event) =>
            update({ entranceAnimationSpeedMs: Number(event.target.value) })
          }
          disabled={!context.settings.entranceAnimationEnabled}
          className={selectClassName}
          aria-label="Text and image entrance animation speed"
        >
          {textImageEntranceSpeedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultTextImagePreviewSettings)}
        className={buttonClassName}
        aria-label="Reset text and image settings to defaults"
      >
        Reset
      </button>
    </div>
  );
}
