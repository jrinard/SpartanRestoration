import type { GoogleReviewsSummary } from "@/lib/google-reviews";

/** How long cached Google Places data stays fresh before another API call. */
export const GOOGLE_REVIEWS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type GoogleReviewsCacheEntry = {
  placeId: string;
  summary: GoogleReviewsSummary;
  /** Lifetime count of successful Google Places API calls for this place ID. */
  googleFetchCount: number;
  cachedAt: string;
};

export type GoogleReviewsFetchResult = {
  summary: GoogleReviewsSummary;
  fromCache: boolean;
  googleFetchCount: number;
  cachedAt: string;
};

export type GoogleReviewsApiResponse = {
  success: boolean;
  message?: string;
  data?: GoogleReviewsSummary;
  meta?: {
    fromCache: boolean;
    googleFetchCount: number;
    cachedAt: string | null;
  };
};
