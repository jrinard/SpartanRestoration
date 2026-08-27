import {
  defaultReviewsBackgroundSettings,
  defaultReviewsPreviewSettings,
  defaultReviewsTopBorderSettings,
  type ReviewsBackgroundMode,
  type ReviewsBackgroundSettings,
  type ReviewsPreviewSettings,
  type ReviewsSectionTheme,
  type ReviewsTopBorderSettings,
} from "@/lib/reviews-preview";
import type { GoogleReview } from "@/lib/google-reviews";
import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { previewGradientDirections } from "@/lib/preview-gradient";
import { getCommittedHomepagePreviewSettings, shouldUsePlaygroundPreviewSettings } from "@/lib/homepage-settings";

import { orgStorageGet, orgStorageSet } from "@/lib/org/browser-storage";

export const reviewsPreviewStorageKey = "lifespring-reviews-preview-v1";

const gradientDirectionValues = new Set<PreviewGradientDirection>(
  previewGradientDirections.map((option) => option.value),
);

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isBackgroundMode(value: unknown): value is ReviewsBackgroundMode {
  return value === "solid" || value === "gradient";
}

function isGradientDirection(value: unknown): value is PreviewGradientDirection {
  return typeof value === "string" && gradientDirectionValues.has(value as PreviewGradientDirection);
}

function isGoogleReview(value: unknown): value is GoogleReview {
  if (!value || typeof value !== "object") return false;
  const review = value as GoogleReview;
  return (
    typeof review.author === "string" &&
    typeof review.rating === "number" &&
    typeof review.text === "string"
  );
}

function isReviewsSectionTheme(value: unknown): value is ReviewsSectionTheme {
  return value === "dark" || value === "light";
}

function normalizeBackgroundSettings(
  value: Partial<ReviewsBackgroundSettings> | undefined,
): ReviewsBackgroundSettings {
  if (!value) return defaultReviewsBackgroundSettings;

  return {
    from: isHexColor(value.from) ? value.from : defaultReviewsBackgroundSettings.from,
    to: isHexColor(value.to) ? value.to : defaultReviewsBackgroundSettings.to,
    direction: isGradientDirection(value.direction)
      ? value.direction
      : defaultReviewsBackgroundSettings.direction,
    intensity:
      typeof value.intensity === "number"
        ? Math.min(100, Math.max(0, value.intensity))
        : defaultReviewsBackgroundSettings.intensity,
  };
}

function normalizeTopBorderSettings(
  value: Partial<ReviewsTopBorderSettings> | undefined,
): ReviewsTopBorderSettings {
  if (!value) return defaultReviewsTopBorderSettings;

  return {
    size:
      typeof value.size === "number"
        ? Math.min(12, Math.max(0, value.size))
        : defaultReviewsTopBorderSettings.size,
    color: isHexColor(value.color) ? value.color : defaultReviewsTopBorderSettings.color,
  };
}

export function normalizeReviewsPreviewSettings(
  value: Partial<ReviewsPreviewSettings>,
): ReviewsPreviewSettings {
  const reviews = Array.isArray(value.reviews)
    ? value.reviews.filter(isGoogleReview)
    : defaultReviewsPreviewSettings.reviews;

  return {
    theme: isReviewsSectionTheme(value.theme) ? value.theme : defaultReviewsPreviewSettings.theme,
    eyebrow:
      typeof value.eyebrow === "string" && value.eyebrow.trim()
        ? value.eyebrow
        : defaultReviewsPreviewSettings.eyebrow,
    headline:
      typeof value.headline === "string" && value.headline.trim()
        ? value.headline.trim() === "Rated 5.0 on Google"
          ? "Rated [RATING] on Google"
          : value.headline
        : defaultReviewsPreviewSettings.headline,
    subtext:
      typeof value.subtext === "string" && value.subtext.trim()
        ? value.subtext.trim() ===
            "Real, verified Google reviews from the homeowners, HOAs, and businesses we have sealed, striped, and swept across Clark County, WA."
          ? defaultReviewsPreviewSettings.subtext
          : value.subtext
        : defaultReviewsPreviewSettings.subtext,
    accentColor: isHexColor(value.accentColor)
      ? value.accentColor
      : defaultReviewsPreviewSettings.accentColor,
    placeId: typeof value.placeId === "string" ? value.placeId : defaultReviewsPreviewSettings.placeId,
    solidBackground: isHexColor(value.solidBackground)
      ? value.solidBackground
      : defaultReviewsPreviewSettings.solidBackground,
    backgroundMode: isBackgroundMode(value.backgroundMode)
      ? value.backgroundMode
      : defaultReviewsPreviewSettings.backgroundMode,
    background: normalizeBackgroundSettings(value.background),
    topBorder: normalizeTopBorderSettings(value.topBorder),
    sliderSpeed:
      typeof value.sliderSpeed === "number"
        ? Math.min(1.2, Math.max(0, value.sliderSpeed))
        : defaultReviewsPreviewSettings.sliderSpeed,
    sliderPaused:
      typeof value.sliderPaused === "boolean"
        ? value.sliderPaused
        : defaultReviewsPreviewSettings.sliderPaused,
    aggregateRating:
      typeof value.aggregateRating === "number"
        ? value.aggregateRating
        : defaultReviewsPreviewSettings.aggregateRating,
    totalReviewCount:
      typeof value.totalReviewCount === "number"
        ? value.totalReviewCount
        : defaultReviewsPreviewSettings.totalReviewCount,
    reviews,
    lastFetchedAt:
      typeof value.lastFetchedAt === "string" || value.lastFetchedAt === null
        ? value.lastFetchedAt
        : defaultReviewsPreviewSettings.lastFetchedAt,
  };
}

function isReviewsPreviewSettings(value: unknown): value is Partial<ReviewsPreviewSettings> {
  return Boolean(value && typeof value === "object");
}

export function loadReviewsPreviewSettings(): ReviewsPreviewSettings {
  if (!shouldUsePlaygroundPreviewSettings()) {
    const committed = getCommittedHomepagePreviewSettings()?.reviews;
    if (committed) return normalizeReviewsPreviewSettings(committed);
  }

  if (typeof window === "undefined") {
    return defaultReviewsPreviewSettings;
  }

  try {
    const stored = orgStorageGet(reviewsPreviewStorageKey);
    if (!stored) return defaultReviewsPreviewSettings;

    const parsed: unknown = JSON.parse(stored);
    if (isReviewsPreviewSettings(parsed)) {
      return normalizeReviewsPreviewSettings(parsed);
    }
  } catch {
    // ignore invalid storage
  }

  return defaultReviewsPreviewSettings;
}

export function saveReviewsPreviewSettings(settings: ReviewsPreviewSettings): void {
  if (typeof window === "undefined") return;
  orgStorageSet(reviewsPreviewStorageKey, JSON.stringify(settings));
}
