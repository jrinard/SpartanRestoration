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
  defaultHeroV21PreviewSettings,
  type HeroV21PreviewSettings,
} from "@/lib/hero-v21-preview";
import {
  loadHeroV21PreviewSettings,
  saveHeroV21PreviewSettings,
} from "@/lib/hero-v21-preview-storage";

type HeroV21PreviewContextValue = {
  settings: HeroV21PreviewSettings;
  setSettings: (settings: HeroV21PreviewSettings) => void;
};

const HeroV21PreviewContext = createContext<HeroV21PreviewContextValue | null>(null);

export function HeroV21PreviewProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<HeroV21PreviewSettings>(
    defaultHeroV21PreviewSettings,
  );

  useEffect(() => {
    setSettingsState(loadHeroV21PreviewSettings());
  }, []);

  const setSettings = useCallback((next: HeroV21PreviewSettings) => {
    setSettingsState(next);
    saveHeroV21PreviewSettings(next);
  }, []);

  return (
    <HeroV21PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </HeroV21PreviewContext.Provider>
  );
}

export function useHeroV21Preview() {
  return useContext(HeroV21PreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const alphaRangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function HeroV21BackgroundControls() {
  const context = useHeroV21Preview();
  if (!context) return null;

  const updateBackground = (patch: Partial<HeroV21BackgroundSettings>) => {
    context.setSettings({
      ...context.settings,
      background: { ...context.settings.background, ...patch },
    });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.background.from}
          onChange={(event) => updateBackground({ from: event.target.value })}
          className={colorInputClassName}
          aria-label="Hero background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.background.to}
          onChange={(event) => updateBackground({ to: event.target.value })}
          className={colorInputClassName}
          aria-label="Hero background gradient end color"
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
          aria-label="Hero background gradient intensity"
        />
        <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
          {context.settings.background.intensity}%
        </span>
      </label>
      <button
        type="button"
        onClick={() =>
          context.setSettings({
            ...context.settings,
            background: defaultHeroV21BackgroundSettings,
          })
        }
        className={buttonClassName}
      >
        Reset BG
      </button>
    </div>
  );
}
