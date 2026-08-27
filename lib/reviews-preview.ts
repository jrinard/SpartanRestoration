import type { PreviewGradientDirection } from "@/lib/preview-gradient";
import { getPreviewGradientBackground } from "@/lib/preview-gradient";
import type { CSSProperties } from "react";
import type { GoogleReview } from "@/lib/google-reviews";

export type ReviewsBackgroundMode = "solid" | "gradient";

export type ReviewsSectionTheme = "dark" | "light";

export type ReviewsBackgroundSettings = {
  from: string;
  to: string;
  direction: PreviewGradientDirection;
  /** 0–100 — gradient overlay strength on the solid base color. */
  intensity: number;
};

export type ReviewsTopBorderSettings = {
  /** Border width in px — 0 hides the border. */
  size: number;
  color: string;
};

export type ReviewsPreviewSettings = {
  theme: ReviewsSectionTheme;
  eyebrow: string;
  headline: string;
  subtext: string;
  accentColor: string;
  placeId: string;
  solidBackground: string;
  backgroundMode: ReviewsBackgroundMode;
  background: ReviewsBackgroundSettings;
  topBorder: ReviewsTopBorderSettings;
  sliderSpeed: number;
  sliderPaused: boolean;
  aggregateRating: number;
  totalReviewCount: number;
  reviews: GoogleReview[];
  lastFetchedAt: string | null;
};

export const defaultReviewsBackgroundSettings: ReviewsBackgroundSettings = {
  from: "#111111",
  to: "#1a2744",
  direction: "to bottom",
  intensity: 0,
};

export const defaultReviewsTopBorderSettings: ReviewsTopBorderSettings = {
  size: 0,
  color: "#ffffff",
};

export const reviewsDarkThemeDefaults = {
  solidBackground: "#111111",
  topBorderColor: "#ffffff",
};

export const reviewsLightThemeDefaults = {
  solidBackground: "#f6f5fa",
  topBorderColor: "#12121c",
};

export function getReviewsThemeDefaults(theme: ReviewsSectionTheme) {
  return theme === "light" ? reviewsLightThemeDefaults : reviewsDarkThemeDefaults;
}

export const defaultReviewsPreviewSettings: ReviewsPreviewSettings = {
  theme: "dark",
  eyebrow: "What Customers Say",
  headline: "Rated [RATING] on Google",
  subtext:
    "Real, verified Google reviews from the local businesses and teams we've partnered with on websites, software, and branding across Clark County and the Pacific Northwest.",
  accentColor: "#4d82b8",
  placeId: "",
  solidBackground: "#111111",
  backgroundMode: "solid",
  background: defaultReviewsBackgroundSettings,
  topBorder: defaultReviewsTopBorderSettings,
  sliderSpeed: 0.22,
  sliderPaused: false,
  aggregateRating: 0,
  totalReviewCount: 0,
  reviews: [],
  lastFetchedAt: null,
};

export const reviewsSliderSpeedPresets = [
  { value: 0, label: "Stopped" },
  { value: 0.12, label: "Very slow" },
  { value: 0.22, label: "Slow" },
  { value: 0.4, label: "Medium" },
  { value: 0.65, label: "Fast" },
] as const;

export const reviewsTopBorderSizePresets = [0, 1, 2, 3, 4, 6, 8] as const;

export const reviewsSectionThemes: { value: ReviewsSectionTheme; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

/** Insert in the headline control — replaced with live Google rating on render. */
export const REVIEWS_HEADLINE_RATING_TOKEN = "[RATING]";

export const REVIEWS_FALLBACK_RATING = 5;

export function resolveReviewsRating(rating: number | null | undefined): number {
  if (typeof rating === "number" && Number.isFinite(rating) && rating > 0) {
    return rating;
  }
  return REVIEWS_FALLBACK_RATING;
}

export function formatReviewsRatingDisplay(rating: number | null | undefined): string {
  return resolveReviewsRating(rating).toFixed(1);
}

/** Replace `[RATING]` in the headline template with the resolved aggregate rating. */
export function formatReviewsHeadline(
  headline: string,
  rating: number | null | undefined,
): string {
  const formatted = formatReviewsRatingDisplay(rating);
  return headline.replace(/\[RATING\]/gi, formatted);
}

function blendWithTransparent(color: string, amountPercent: number): string {
  return `color-mix(in srgb, ${color} ${amountPercent}%, transparent)`;
}

/** Gradient overlay on top of the section solid base color. */
export function getReviewsBackgroundStyle(
  settings: ReviewsPreviewSettings,
): CSSProperties | undefined {
  if (settings.backgroundMode !== "gradient") return undefined;

  const { from, to, direction, intensity } = settings.background;
  if (intensity <= 0) return undefined;

  const directionValue = direction === "none" ? "to bottom" : direction;
  const fromMix = blendWithTransparent(from, intensity);
  const toMix = blendWithTransparent(to, intensity);

  return {
    background: getPreviewGradientBackground(fromMix, toMix, directionValue),
  };
}
