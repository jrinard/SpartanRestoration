"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  defaultReviewsPreviewSettings,
  getReviewsThemeDefaults,
  reviewsSectionThemes,
  reviewsSliderSpeedPresets,
  reviewsTopBorderSizePresets,
  type ReviewsBackgroundMode,
  type ReviewsBackgroundSettings,
  type ReviewsPreviewSettings,
  type ReviewsSectionTheme,
  type ReviewsTopBorderSettings,
} from "@/lib/reviews-preview";
import { mergeReviewsIntoSettings, requestGoogleReviews } from "@/lib/google-reviews-client";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import { previewGradientDirections } from "@/lib/preview-gradient";
import {
  loadReviewsPreviewSettings,
  normalizeReviewsPreviewSettings,
  saveReviewsPreviewSettings,
} from "@/lib/reviews-preview-storage";

type ReviewsPreviewContextValue = {
  settings: ReviewsPreviewSettings;
  setSettings: (settings: ReviewsPreviewSettings) => void;
  fetchReviews: () => Promise<void>;
  isFetching: boolean;
  fetchError: string | null;
  canEdit: boolean;
};

const ReviewsPreviewContext = createContext<ReviewsPreviewContextValue | null>(null);

export function ReviewsPreviewProvider({
  children,
  instanceId,
  initialSettings,
}: {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: ReviewsPreviewSettings;
}) {
  const { settings, setSettings, lockedToPublished } = useInstancePreviewSettings({
    instanceId,
    field: "reviews",
    initialSettings,
    defaultSettings: defaultReviewsPreviewSettings,
    loadGlobal: loadReviewsPreviewSettings,
    saveGlobal: saveReviewsPreviewSettings,
    normalize: normalizeReviewsPreviewSettings,
  });

  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    const placeId = settings.placeId.trim();
    if (!placeId) {
      setFetchError("Add a Google Place ID in the section controls first.");
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      const result = await requestGoogleReviews(placeId, { force: true });
      const { summary } = result;
      const mergedReviews = mergeReviewsIntoSettings(settings.reviews, summary);
      setSettings({
        ...settings,
        placeId: summary.placeId,
        aggregateRating: summary.rating,
        totalReviewCount: summary.totalReviews,
        reviews: mergedReviews,
        lastFetchedAt: summary.fetchedAt,
      });
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to fetch Google reviews.");
    } finally {
      setIsFetching(false);
    }
  }, [setSettings, settings]);

  return (
    <ReviewsPreviewContext.Provider
      value={{
        settings,
        setSettings,
        fetchReviews,
        isFetching,
        fetchError,
        canEdit: !lockedToPublished,
      }}
    >
      {children}
    </ReviewsPreviewContext.Provider>
  );
}

export function useReviewsPreview() {
  return useContext(ReviewsPreviewContext);
}

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

const alphaRangeClassName = "h-1.5 w-20 cursor-pointer accent-accent-purple";

const buttonClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10";

const selectClassName =
  "rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const textInputClassName =
  "max-w-[12rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

export function ReviewsPreviewControls() {
  const context = useReviewsPreview();
  if (!context) return null;

  const settings = normalizeReviewsPreviewSettings(context.settings);
  const setSettings = (next: ReviewsPreviewSettings) => {
    context.setSettings(normalizeReviewsPreviewSettings(next));
  };

  const update = (patch: Partial<ReviewsPreviewSettings>) => {
    setSettings({ ...settings, ...patch });
  };

  const updateBackground = (patch: Partial<ReviewsBackgroundSettings>) => {
    update({
      background: { ...settings.background, ...patch },
    });
  };

  const updateTopBorder = (patch: Partial<ReviewsTopBorderSettings>) => {
    update({
      topBorder: { ...settings.topBorder, ...patch },
    });
  };

  const setBackgroundMode = (backgroundMode: ReviewsBackgroundMode) => {
    update({
      backgroundMode,
      background:
        backgroundMode === "gradient" && settings.background.intensity <= 0
          ? { ...settings.background, intensity: 50 }
          : settings.background,
    });
  };

  return (
    <div className="contents">
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Theme</span>
        <select
          value={settings.theme}
          onChange={(event) => {
            const theme = event.target.value as ReviewsSectionTheme;
            const themeDefaults = getReviewsThemeDefaults(theme);
            update({
              theme,
              solidBackground: themeDefaults.solidBackground,
              topBorder: { ...settings.topBorder, color: themeDefaults.topBorderColor },
            });
          }}
          className={selectClassName}
          aria-label="Reviews section theme"
        >
          {reviewsSectionThemes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Accent</span>
        <input
          type="color"
          value={settings.accentColor}
          onChange={(event) => update({ accentColor: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviews eyebrow accent color"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Eyebrow</span>
        <input
          type="text"
          value={settings.eyebrow}
          onChange={(event) => update({ eyebrow: event.target.value })}
          className={textInputClassName}
          aria-label="Reviews eyebrow text"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Headline</span>
        <input
          type="text"
          value={settings.headline}
          onChange={(event) => update({ headline: event.target.value })}
          className={textInputClassName}
          aria-label="Reviews headline text"
          placeholder="Rated [RATING] on Google"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Subtext</span>
        <input
          type="text"
          value={settings.subtext}
          onChange={(event) => update({ subtext: event.target.value })}
          className="max-w-[16rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
          aria-label="Reviews subtext"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Place ID</span>
        <input
          type="text"
          value={settings.placeId}
          onChange={(event) => update({ placeId: event.target.value })}
          className="max-w-[14rem] rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-xs text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
          placeholder="ChIJ..."
          aria-label="Google Place ID"
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG</span>
        <select
          value={settings.backgroundMode}
          onChange={(event) => setBackgroundMode(event.target.value as ReviewsBackgroundMode)}
          className={selectClassName}
          aria-label="Reviews background mode"
        >
          <option value="solid">Solid</option>
          <option value="gradient">Gradient</option>
        </select>
        <input
          type="color"
          value={settings.solidBackground}
          onChange={(event) => update({ solidBackground: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviews solid background color"
        />
      </label>
      {settings.backgroundMode === "gradient" && (
        <>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Grad 1</span>
            <input
              type="color"
              value={settings.background.from}
              onChange={(event) => updateBackground({ from: event.target.value })}
              className={colorInputClassName}
              aria-label="Reviews gradient start color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Grad 2</span>
            <input
              type="color"
              value={settings.background.to}
              onChange={(event) => updateBackground({ to: event.target.value })}
              className={colorInputClassName}
              aria-label="Reviews gradient end color"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Direction</span>
            <select
              value={settings.background.direction}
              onChange={(event) =>
                updateBackground({
                  direction: event.target.value as ReviewsBackgroundSettings["direction"],
                })
              }
              className={selectClassName}
              aria-label="Reviews background gradient direction"
            >
              {previewGradientDirections
                .filter((option) => option.value !== "none")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Intensity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.background.intensity}
              onChange={(event) => updateBackground({ intensity: Number(event.target.value) })}
              className={alphaRangeClassName}
              aria-label="Reviews gradient intensity"
            />
          </label>
        </>
      )}
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Top border</span>
        <select
          value={settings.topBorder.size}
          onChange={(event) => updateTopBorder({ size: Number(event.target.value) })}
          className={selectClassName}
          aria-label="Reviews top border size"
        >
          {reviewsTopBorderSizePresets.map((size) => (
            <option key={size} value={size}>
              {size === 0 ? "None" : `${size}px`}
            </option>
          ))}
        </select>
        <input
          type="color"
          value={settings.topBorder.color}
          onChange={(event) => updateTopBorder({ color: event.target.value })}
          className={colorInputClassName}
          aria-label="Reviews top border color"
          disabled={settings.topBorder.size <= 0}
        />
      </label>
      <label className="flex items-center gap-2">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Speed</span>
        <select
          value={settings.sliderPaused ? 0 : settings.sliderSpeed}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value === 0) {
              update({ sliderPaused: true, sliderSpeed: settings.sliderSpeed || 0.22 });
            } else {
              update({ sliderPaused: false, sliderSpeed: value });
            }
          }}
          className={selectClassName}
          aria-label="Reviews carousel speed"
        >
          {reviewsSliderSpeedPresets.map((preset) => (
            <option key={preset.label} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => context.fetchReviews()}
        disabled={context.isFetching}
        className={buttonClassName}
      >
        {context.isFetching ? "Fetching…" : "Get reviews"}
      </button>
    </div>
  );
}
