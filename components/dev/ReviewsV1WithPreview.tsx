"use client";

import { ReviewsV1 } from "@/components/sections/Reviews-v1";
import { reviewsV1PlaceholderReviews } from "@/lib/demo-content";

export function ReviewsV1WithPreview() {
  return <ReviewsV1 placeholderReviews={reviewsV1PlaceholderReviews} />;
}
