"use client";

import type { GoogleReview, GoogleReviewsSummary } from "@/lib/google-reviews";
import type { GoogleReviewsApiResponse } from "@/lib/google-reviews.types";
import { mergeUniqueGoogleReviews } from "@/lib/reviews-marquee";

export type GoogleReviewsClientResult = {
  summary: GoogleReviewsSummary;
  fromCache: boolean;
  googleFetchCount: number;
  cachedAt: string | null;
};

export async function requestGoogleReviews(
  placeId: string,
  options?: { force?: boolean },
): Promise<GoogleReviewsClientResult> {
  const trimmedPlaceId = placeId.trim();
  if (!trimmedPlaceId) {
    throw new Error("Place ID is required.");
  }

  const params = new URLSearchParams({ placeId: trimmedPlaceId });
  if (options?.force) {
    params.set("force", "true");
  }

  const response = await fetch(`/api/google-reviews?${params.toString()}`);
  const payload = (await response.json()) as GoogleReviewsApiResponse;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message ?? "Failed to fetch Google reviews.");
  }

  return {
    summary: payload.data,
    fromCache: payload.meta?.fromCache ?? false,
    googleFetchCount: payload.meta?.googleFetchCount ?? 0,
    cachedAt: payload.meta?.cachedAt ?? payload.data.fetchedAt,
  };
}

export function mergeReviewsIntoSettings(
  existingReviews: GoogleReview[],
  summary: GoogleReviewsSummary,
): GoogleReview[] {
  const mergedReviews = mergeUniqueGoogleReviews(existingReviews, summary.reviews);
  return mergedReviews.length > 0 ? mergedReviews : existingReviews;
}
