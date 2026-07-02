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
  defaultHeroV1PreviewSettings,
  type HeroV1PreviewSettings,
} from "@/lib/hero-v1-preview";
import {
  loadHeroV1PreviewSettings,
  normalizeHeroV1PreviewSettings,
  saveHeroV1PreviewSettings,
} from "@/lib/hero-v1-preview-storage";

type HeroV1PreviewContextValue = {
  settings: HeroV1PreviewSettings;
  setSettings: (settings: HeroV1PreviewSettings) => void;
};

const HeroV1PreviewContext = createContext<HeroV1PreviewContextValue | null>(null);

type HeroV1PreviewProviderProps = {
  children: ReactNode;
  initialSettings?: HeroV1PreviewSettings;
};

export function HeroV1PreviewProvider({
  children,
  initialSettings,
}: HeroV1PreviewProviderProps) {
  const lockedToPublished = initialSettings !== undefined;

  const [settings, setSettingsState] = useState<HeroV1PreviewSettings>(() =>
    initialSettings
      ? normalizeHeroV1PreviewSettings(initialSettings)
      : defaultHeroV1PreviewSettings,
  );

  useEffect(() => {
    if (lockedToPublished) return;
    setSettingsState(loadHeroV1PreviewSettings());
  }, [lockedToPublished]);

  const setSettings = useCallback(
    (next: HeroV1PreviewSettings) => {
      if (lockedToPublished) return;
      setSettingsState(next);
      saveHeroV1PreviewSettings(next);
    },
    [lockedToPublished],
  );

  return (
    <HeroV1PreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </HeroV1PreviewContext.Provider>
  );
}

export function useHeroV1Preview() {
  return useContext(HeroV1PreviewContext);
}

const textInputClassName =
  "min-w-[10rem] max-w-[18rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

export function HeroV1PreviewControls() {
  const context = useHeroV1Preview();
  if (!context) return null;

  const update = (patch: Partial<HeroV1PreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="text"
          value={context.settings.headline}
          onChange={(event) => update({ headline: event.target.value })}
          className={textInputClassName}
          aria-label="Hero headline"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Subtext</span>
        <input
          type="text"
          value={context.settings.subtext}
          onChange={(event) => update({ subtext: event.target.value })}
          className={textInputClassName}
          aria-label="Hero subtext"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Button</span>
        <input
          type="text"
          value={context.settings.ctaLabel}
          onChange={(event) => update({ ctaLabel: event.target.value })}
          className="min-w-[6rem] max-w-[12rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
          aria-label="Hero button label"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">btn-color</span>
        <input
          type="color"
          value={context.settings.buttonColor}
          onChange={(event) => update({ buttonColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Hero button color"
        />
      </label>
      <button
        type="button"
        onClick={() => context.setSettings(defaultHeroV1PreviewSettings)}
        className={buttonClassName}
      >
        Reset
      </button>
    </div>
  );
}
