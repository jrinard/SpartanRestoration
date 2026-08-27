import { getGooglePlaceReviews } from "@/lib/google-reviews-cache.server";
import type { GoogleReviewsApiResponse } from "@/lib/google-reviews.types";

/** 24 hours — CDN cache for production traffic (see Cache-Control below). */
const REVALIDATE_SECONDS = 86_400;

const sharedCacheControl = `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS}`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();
  const force = searchParams.get("force") === "true";

  if (!placeId) {
    return Response.json(
      { success: false, message: "placeId query parameter is required." } satisfies GoogleReviewsApiResponse,
      { status: 400 },
    );
  }

  try {
    const result = await getGooglePlaceReviews(placeId, { force });
    return Response.json(
      {
        success: true,
        data: result.summary,
        meta: {
          fromCache: result.fromCache,
          googleFetchCount: result.googleFetchCount,
          cachedAt: result.cachedAt,
        },
      } satisfies GoogleReviewsApiResponse,
      {
        headers: {
          "Cache-Control": force ? "private, no-store" : sharedCacheControl,
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch Google reviews.";
    return Response.json({ success: false, message } satisfies GoogleReviewsApiResponse, { status: 502 });
  }
}
