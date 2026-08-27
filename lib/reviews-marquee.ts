import type { GoogleReview } from "@/lib/google-reviews";

/** Minimum cards in the marquee track before the seamless loop duplicate. */
export const REVIEWS_MARQUEE_MIN_CARDS = 50;

export function reviewIdentityKey(review: GoogleReview): string {
  return `${review.author.trim().toLowerCase()}|${review.text.trim()}|${review.relativeTime ?? ""}`;
}

/** Keep first occurrence of each unique review. */
export function dedupeGoogleReviews(reviews: GoogleReview[]): GoogleReview[] {
  const seen = new Set<string>();
  const unique: GoogleReview[] = [];

  for (const review of reviews) {
    const key = reviewIdentityKey(review);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(review);
  }

  return unique;
}

/** Merge multiple review lists, preserving order and uniqueness. */
export function mergeUniqueGoogleReviews(...lists: GoogleReview[][]): GoogleReview[] {
  return dedupeGoogleReviews(lists.flat());
}

/**
 * Expand a unique review set to at least `minimum` cards by cycling through
 * all reviews before repeating. If more than `minimum` unique reviews exist,
 * return them all without truncation.
 */
export function expandReviewsForMarquee(
  reviews: GoogleReview[],
  minimum = REVIEWS_MARQUEE_MIN_CARDS,
): GoogleReview[] {
  const unique = dedupeGoogleReviews(reviews);
  if (unique.length === 0) return [];
  if (unique.length >= minimum) return unique;

  const expanded: GoogleReview[] = [];
  while (expanded.length < minimum) {
    for (const review of unique) {
      expanded.push(review);
      if (expanded.length >= minimum) break;
    }
  }

  return expanded;
}

/** Two identical copies for a seamless infinite horizontal marquee. */
export function buildSeamlessMarqueeReviews(
  reviews: GoogleReview[],
  minimum = REVIEWS_MARQUEE_MIN_CARDS,
): GoogleReview[] {
  const base = expandReviewsForMarquee(reviews, minimum);
  return [...base, ...base];
}

export function countUniqueGoogleReviews(reviews: GoogleReview[]): number {
  return dedupeGoogleReviews(reviews).length;
}
