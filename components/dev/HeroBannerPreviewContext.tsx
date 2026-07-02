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
  defaultHeroV21BackgroundSettings,
  type HeroV21BackgroundSettings,
} from "@/lib/hero-v21-background-preview";
import {
  defaultHeroBannerPreviewSettings,
  heroBannerTransitions,
  heroBannerHeightOptions,
  type HeroBannerPreviewSettings,
  type HeroBannerTransition,
} from "@/lib/hero-banner-preview";
import {
  loadHeroBannerPreviewSettings,
  normalizeHeroBannerPreviewSettings,
  saveHeroBannerPreviewSettings,
} from "@/lib/hero-banner-preview-storage";

type HeroBannerPreviewContextValue = {
  settings: HeroBannerPreviewSettings;
  setSettings: (settings: HeroBannerPreviewSettings) => void;
};

const HeroBannerPreviewContext = createContext<HeroBannerPreviewContextValue | null>(null);

type HeroBannerPreviewProviderProps = {
  children: ReactNode;
  initialSettings?: HeroBannerPreviewSettings;
};

export function HeroBannerPreviewProvider({
  children,
  initialSettings,
}: HeroBannerPreviewProviderProps) {
  const lockedToPublished = initialSettings !== undefined;

  const [settings, setSettingsState] = useState<HeroBannerPreviewSettings>(() =>
    initialSettings
      ? normalizeHeroBannerPreviewSettings(initialSettings)
      : defaultHeroBannerPreviewSettings,
  );

  useEffect(() => {
    if (lockedToPublished) return;
    setSettingsState(loadHeroBannerPreviewSettings());
  }, [lockedToPublished]);

  const setSettings = useCallback(
    (next: HeroBannerPreviewSettings) => {
      if (lockedToPublished) return;
      setSettingsState(next);
      saveHeroBannerPreviewSettings(next);
    },
    [lockedToPublished],
  );

  return (
    <HeroBannerPreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </HeroBannerPreviewContext.Provider>
  );
}

export function useHeroBannerPreview() {
  return useContext(HeroBannerPreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const numberInputClassName =
  "w-16 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const alphaRangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function HeroBannerPreviewControls() {
  const context = useHeroBannerPreview();
  if (!context) return null;

  const updateBackground = (patch: Partial<HeroV21BackgroundSettings>) => {
    context.setSettings({
      ...context.settings,
      background: { ...context.settings.background, ...patch },
    });
  };

  const update = (patch: Partial<HeroBannerPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  const timerSeconds = Math.round(context.settings.intervalMs / 1000);

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.background.from}
          onChange={(event) => updateBackground({ from: event.target.value })}
          className={colorInputClassName}
          aria-label="Banner gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.background.to}
          onChange={(event) => updateBackground({ to: event.target.value })}
          className={colorInputClassName}
          aria-label="Banner gradient end color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Intensity</span>
        <input
          type="range"
          min={0}
          max={100}
          value={context.settings.background.intensity}
          onChange={(event) => updateBackground({ intensity: Number(event.target.value) })}
          className={alphaRangeClassName}
          aria-label="Banner gradient intensity"
        />
        <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
          {context.settings.background.intensity}%
        </span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Height</span>
        <select
          value={context.settings.heightPx}
          onChange={(event) => update({ heightPx: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Banner height"
        >
          {heroBannerHeightOptions.map((height) => (
            <option key={height} value={height}>
              {height}px
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
          value={timerSeconds}
          onChange={(event) => {
            const seconds = Number(event.target.value);
            if (Number.isNaN(seconds)) return;
            update({ intervalMs: Math.min(60, Math.max(2, seconds)) * 1000 });
          }}
          className={numberInputClassName}
          aria-label="Banner slide timer in seconds"
        />
        <span className="font-mono text-[0.65rem] text-accent-purple">sec</span>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Transition</span>
        <select
          value={context.settings.transition}
          onChange={(event) => update({ transition: event.target.value as HeroBannerTransition })}
          className={selectClassName}
          aria-label="Banner slide transition"
        >
          {heroBannerTransitions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultHeroBannerPreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}
