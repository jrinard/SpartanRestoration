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
  defaultReviewboxPreviewSettings,
  getReviewboxTextColorsForTheme,
  reviewboxSectionThemes,
  type ReviewboxPreviewSettings,
  type ReviewboxSectionTheme,
} from "@/lib/reviewbox-preview";
import {
  loadReviewboxPreviewSettings,
  saveReviewboxPreviewSettings,
} from "@/lib/reviewbox-preview-storage";

type ReviewboxPreviewContextValue = {
  settings: ReviewboxPreviewSettings;
  setSettings: (settings: ReviewboxPreviewSettings) => void;
};

const ReviewboxPreviewContext = createContext<ReviewboxPreviewContextValue | null>(null);

export function ReviewboxPreviewProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<ReviewboxPreviewSettings>(
    defaultReviewboxPreviewSettings,
  );

  useEffect(() => {
    setSettingsState(loadReviewboxPreviewSettings());
  }, []);

  const setSettings = useCallback((next: ReviewboxPreviewSettings) => {
    setSettingsState(next);
    saveReviewboxPreviewSettings(next);
  }, []);

  return (
    <ReviewboxPreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </ReviewboxPreviewContext.Provider>
  );
}

export function useReviewboxPreview() {
  return useContext(ReviewboxPreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const alphaRangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

export function ReviewboxBackgroundControls() {
  const context = useReviewboxPreview();
  if (!context) return null;

  const updateBackground = (patch: Partial<HeroV21BackgroundSettings>) => {
    context.setSettings({
      ...context.settings,
      background: { ...context.settings.background, ...patch },
    });
  };

  const update = (patch: Partial<ReviewboxPreviewSettings>) => {
    context.setSettings({ ...context.settings, ...patch });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={context.settings.theme}
          onChange={(event) => {
            const theme = event.target.value as ReviewboxSectionTheme;
            update({
              theme,
              ...getReviewboxTextColorsForTheme(theme),
            });
          }}
          className={selectClassName}
          aria-label="Reviewbox section theme"
        >
          {reviewboxSectionThemes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Title</span>
        <input
          type="color"
          value={context.settings.titleColor}
          onChange={(event) => update({ titleColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviewbox title and bullet color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Body</span>
        <input
          type="color"
          value={context.settings.bodyColor}
          onChange={(event) => update({ bodyColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviewbox body text color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.settings.background.from}
          onChange={(event) => updateBackground({ from: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviewbox background gradient start color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.settings.background.to}
          onChange={(event) => updateBackground({ to: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviewbox background gradient end color"
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
          aria-label="Reviewbox background gradient intensity"
        />
        <span className="w-8 font-mono text-[0.65rem] text-accent-purple">
          {context.settings.background.intensity}%
        </span>
      </label>
      <button
        type="button"
        onClick={() => update(getReviewboxTextColorsForTheme(context.settings.theme))}
        className={buttonClassName}
      >
        Reset text
      </button>
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
