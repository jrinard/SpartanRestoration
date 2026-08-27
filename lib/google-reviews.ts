/** Normalized Google review for Reviews-v1 section. */
export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime?: string;
  profilePhotoUrl?: string;
};

export type GoogleReviewsSummary = {
  placeId: string;
  placeName?: string;
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  fetchedAt: string;
};

export function clampRating(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}
