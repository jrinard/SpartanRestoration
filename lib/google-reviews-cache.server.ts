import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { GoogleReview, GoogleReviewsSummary } from "@/lib/google-reviews";
import { clampRating } from "@/lib/google-reviews";
import { dedupeGoogleReviews } from "@/lib/reviews-marquee";
import type { GoogleReviewsCacheEntry, GoogleReviewsFetchResult } from "@/lib/google-reviews.types";
import { GOOGLE_REVIEWS_CACHE_TTL_MS } from "@/lib/google-reviews.types";

const cacheDirectory = path.join(process.cwd(), "lib/google-reviews-cache");

const memoryCache = new Map<string, GoogleReviewsCacheEntry>();

type PlacesReview = {
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
};

type PlacesDetailsResponse = {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: PlacesReview[];
  error?: { message?: string; status?: string };
};

function cacheFilePath(placeId: string): string {
  const safeId = placeId.replace(/[^a-zA-Z0-9_-]+/g, "_");
  return path.join(cacheDirectory, `${safeId}.json`);
}

function normalizeReview(review: PlacesReview): GoogleReview | null {
  const author = review.authorAttribution?.displayName?.trim();
  if (!author) return null;

  const text = review.text?.text?.trim() || "Left a rating on Google.";

  return {
    author,
    rating: clampRating(review.rating ?? 5),
    text,
    relativeTime: review.relativePublishTimeDescription,
    profilePhotoUrl: review.authorAttribution?.photoUri,
  };
}

function isCacheEntry(value: unknown): value is GoogleReviewsCacheEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as GoogleReviewsCacheEntry;
  return (
    typeof entry.placeId === "string" &&
    typeof entry.googleFetchCount === "number" &&
    typeof entry.cachedAt === "string" &&
    Boolean(entry.summary && typeof entry.summary === "object")
  );
}

async function readCacheEntry(placeId: string): Promise<GoogleReviewsCacheEntry | null> {
  const fromMemory = memoryCache.get(placeId);
  if (fromMemory) return fromMemory;

  try {
    const raw = await readFile(cacheFilePath(placeId), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isCacheEntry(parsed) || parsed.placeId !== placeId) return null;
    memoryCache.set(placeId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

async function writeCacheEntry(entry: GoogleReviewsCacheEntry): Promise<void> {
  memoryCache.set(entry.placeId, entry);
  await mkdir(cacheDirectory, { recursive: true });
  await writeFile(cacheFilePath(entry.placeId), `${JSON.stringify(entry, null, 2)}\n`, "utf8");
}

function isCacheFresh(entry: GoogleReviewsCacheEntry): boolean {
  const cachedAtMs = Date.parse(entry.cachedAt);
  if (!Number.isFinite(cachedAtMs)) return false;
  return Date.now() - cachedAtMs < GOOGLE_REVIEWS_CACHE_TTL_MS;
}

async function fetchFromGooglePlaces(placeId: string): Promise<GoogleReviewsSummary> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured.");
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Google Places API returned ${response.status}.`);
  }

  const data = (await response.json()) as PlacesDetailsResponse;
  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const reviews = dedupeGoogleReviews(
    (data.reviews ?? [])
      .map(normalizeReview)
      .filter((review): review is GoogleReview => review !== null),
  );

  return {
    placeId,
    placeName: data.displayName?.text,
    rating: typeof data.rating === "number" ? data.rating : 0,
    totalReviews: typeof data.userRatingCount === "number" ? data.userRatingCount : reviews.length,
    reviews,
    fetchedAt: new Date().toISOString(),
  };
}

const REVALIDATE_SECONDS = Math.floor(GOOGLE_REVIEWS_CACHE_TTL_MS / 1000);

function getSharedGoogleReviewsFetch(placeId: string) {
  return unstable_cache(
    async () => fetchFromGooglePlaces(placeId),
    ["google-place-reviews", placeId],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [`google-reviews-${placeId}`],
    },
  );
}

export async function getGooglePlaceReviews(
  placeId: string,
  options?: { force?: boolean },
): Promise<GoogleReviewsFetchResult> {
  const trimmedPlaceId = placeId.trim();
  if (!trimmedPlaceId) {
    throw new Error("Place ID is required.");
  }

  const cached = await readCacheEntry(trimmedPlaceId);
  if (cached && isCacheFresh(cached) && !options?.force) {
    return {
      summary: cached.summary,
      fromCache: true,
      googleFetchCount: cached.googleFetchCount,
      cachedAt: cached.cachedAt,
    };
  }

  const previousSummaryFetchedAt = cached?.summary.fetchedAt;
  const summary = options?.force
    ? await fetchFromGooglePlaces(trimmedPlaceId)
    : await getSharedGoogleReviewsFetch(trimmedPlaceId)();

  const googleApiCalled =
    options?.force === true ||
    !cached ||
    summary.fetchedAt !== previousSummaryFetchedAt;

  const cachedAt = summary.fetchedAt;
  const googleFetchCount = (cached?.googleFetchCount ?? 0) + (googleApiCalled ? 1 : 0);

  await writeCacheEntry({
    placeId: trimmedPlaceId,
    summary,
    googleFetchCount,
    cachedAt,
  });

  return {
    summary,
    fromCache: !googleApiCalled,
    googleFetchCount,
    cachedAt,
  };
}
