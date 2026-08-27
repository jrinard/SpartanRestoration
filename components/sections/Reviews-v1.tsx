"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReviewsPreview } from "@/components/dev/ReviewsPreviewContext";
import { Container } from "@/components/ui/Container";
import type { GoogleReview } from "@/lib/google-reviews";
import { mergeReviewsIntoSettings, requestGoogleReviews } from "@/lib/google-reviews-client";
import {
  defaultReviewsPreviewSettings,
  formatReviewsHeadline,
  formatReviewsRatingDisplay,
  getReviewsBackgroundStyle,
  resolveReviewsRating,
} from "@/lib/reviews-preview";
import { normalizeReviewsPreviewSettings } from "@/lib/reviews-preview-storage";
import { buildSeamlessMarqueeReviews, dedupeGoogleReviews } from "@/lib/reviews-marquee";

type ReviewsV1Props = {
  /** Playground-only lorem cards when no Place ID and no cached reviews. */
  placeholderReviews?: GoogleReview[];
};

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <span className="reviews-v1-stars" aria-label={`${count} out of 5 stars`}>
      {"★".repeat(count)}
    </span>
  );
}

function AggregateStarRating({ rating }: { rating: number }) {
  const value = resolveReviewsRating(rating);
  const fillPercent = Math.min(100, Math.max(0, (value / 5) * 100));

  return (
    <span
      className="reviews-v1-stars reviews-v1-stars--aggregate"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <span className="reviews-v1-stars-track" aria-hidden="true">
        {"★★★★★"}
      </span>
      <span
        className="reviews-v1-stars-fill"
        style={{ width: `${fillPercent}%` }}
        aria-hidden="true"
      >
        {"★★★★★"}
      </span>
    </span>
  );
}

function formatRating(value: number): string {
  return formatReviewsRatingDisplay(value);
}

function ReviewCard({ review }: { review: GoogleReview }) {
  return (
    <article className="reviews-v1-card">
      <div className="reviews-v1-card-header">
        <StarRating count={review.rating} />
        <GoogleLogo className="reviews-v1-google-logo" />
      </div>
      <blockquote className="reviews-v1-card-quote">&ldquo;{review.text}&rdquo;</blockquote>
      <footer className="reviews-v1-card-footer">
        <p className="reviews-v1-card-author">{review.author}</p>
        {review.relativeTime && <p className="reviews-v1-card-time">{review.relativeTime}</p>}
      </footer>
    </article>
  );
}

function RatingSummaryCard({
  rating,
  totalReviews,
  onFetch,
  isFetching,
  fetchError,
  showFetchButton,
  googleFetchCount,
  placeholderMode,
}: {
  rating: number;
  totalReviews: number;
  onFetch?: () => void;
  isFetching?: boolean;
  fetchError?: string | null;
  showFetchButton?: boolean;
  googleFetchCount?: number | null;
  placeholderMode?: boolean;
}) {
  return (
    <div className="reviews-v1-summary">
      {showFetchButton && onFetch && (
        <button
          type="button"
          className="reviews-v1-fetch-btn"
          onClick={onFetch}
          disabled={isFetching}
        >
          {isFetching ? "Fetching…" : "Get reviews"}
        </button>
      )}
      {!showFetchButton && typeof googleFetchCount === "number" && (
        <p className="reviews-v1-api-fetch-count" aria-label={`${googleFetchCount} Google API fetches`}>
          {googleFetchCount}
        </p>
      )}
      <div
        className="reviews-v1-summary-card"
        aria-label={
          placeholderMode ? "Google Place ID required" : `${formatRating(rating)} stars on Google`
        }
      >
        <div className="reviews-v1-summary-score-row">
          <span className="reviews-v1-summary-score">
            {placeholderMode ? "—" : formatRating(rating)}
          </span>
          {placeholderMode ? null : <AggregateStarRating rating={rating} />}
        </div>
        <p className="reviews-v1-summary-count">
          {placeholderMode ? "Google Place ID required" : `${totalReviews} Google reviews`}
        </p>
      </div>
      {fetchError && <p className="reviews-v1-fetch-error">{fetchError}</p>}
    </div>
  );
}

/**
 * Google reviews marquee — header copy left, rating summary right, auto-scrolling cards.
 */
export function ReviewsV1({ placeholderReviews = [] }: ReviewsV1Props) {
  const preview = useReviewsPreview();
  const settings = normalizeReviewsPreviewSettings(
    preview?.settings ?? defaultReviewsPreviewSettings,
  );
  const isPlayground = Boolean(preview?.canEdit);
  const hasPlaceId = settings.placeId.trim().length > 0;
  const hasCachedReviews = settings.reviews.length > 0;
  const usePlaceholders = isPlayground && !hasPlaceId && !hasCachedReviews;
  const needsPlaceIdNotice = isPlayground && !hasPlaceId;

  const [liveReviews, setLiveReviews] = useState<GoogleReview[] | null>(null);
  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [liveTotalReviews, setLiveTotalReviews] = useState<number | null>(null);
  const [googleFetchCount, setGoogleFetchCount] = useState<number | null>(null);

  useEffect(() => {
    if (isPlayground) return;

    const placeId = settings.placeId.trim();
    if (!placeId) return;

    let cancelled = false;

    void requestGoogleReviews(placeId)
      .then((result) => {
        if (cancelled) return;

        setLiveReviews(mergeReviewsIntoSettings(settings.reviews, result.summary));
        setLiveRating(result.summary.rating);
        setLiveTotalReviews(result.summary.totalReviews);
        setGoogleFetchCount(result.googleFetchCount);
      })
      .catch(() => {
        // Keep published settings when sync fails.
      });

    return () => {
      cancelled = true;
    };
  }, [isPlayground, settings.placeId]);

  const resolvedReviews =
    liveReviews ??
    (settings.reviews.length > 0
      ? settings.reviews
      : usePlaceholders
        ? placeholderReviews
        : []);

  const uniqueReviews = useMemo(
    () => dedupeGoogleReviews(resolvedReviews),
    [resolvedReviews],
  );

  const loopReviews = useMemo(
    () => buildSeamlessMarqueeReviews(uniqueReviews),
    [uniqueReviews],
  );

  const displayRating = resolveReviewsRating(liveRating ?? settings.aggregateRating);
  const displayTotalReviews = liveTotalReviews ?? settings.totalReviewCount;
  const displayHeadline = usePlaceholders
    ? settings.headline.replace(/\[RATING\]/gi, "—")
    : formatReviewsHeadline(settings.headline, liveRating ?? settings.aggregateRating);

  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const gradientStyle = getReviewsBackgroundStyle(settings);

  const sectionStyle = {
    "--reviews-accent": settings.accentColor,
    "--reviews-solid-bg": settings.solidBackground,
    backgroundColor: settings.solidBackground,
    borderTop:
      settings.topBorder.size > 0
        ? `${settings.topBorder.size}px solid ${settings.topBorder.color}`
        : undefined,
  } as CSSProperties;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || settings.sliderPaused || settings.sliderSpeed <= 0) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const tick = () => {
      const halfWidth = track.scrollWidth / 2;
      if (halfWidth <= 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      offsetRef.current += settings.sliderSpeed;
      if (offsetRef.current >= halfWidth) {
        offsetRef.current = 0;
      }

      track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [loopReviews.length, settings.sliderPaused, settings.sliderSpeed]);

  useEffect(() => {
    offsetRef.current = 0;
    if (trackRef.current) {
      trackRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  }, [uniqueReviews]);

  return (
    <section
      id="reviews"
      className="reviews-v1 relative scroll-mt-24 py-[calc(5rem-10px)]"
      data-reviews-theme={settings.theme}
      aria-labelledby="reviews-heading"
      style={sectionStyle}
    >
      {gradientStyle && (
        <div className="reviews-v1-bg-gradient pointer-events-none absolute inset-0" style={gradientStyle} />
      )}

      <Container className="relative max-w-[100rem] lg:px-10">
        <div className="reviews-v1-header">
          <div className="reviews-v1-header-copy">
            <p className="reviews-v1-eyebrow">{settings.eyebrow}</p>
            <h2 id="reviews-heading" className="reviews-v1-headline">
              {displayHeadline}
            </h2>
            <p className="reviews-v1-subtext">{settings.subtext}</p>
            {needsPlaceIdNotice ? (
              <p className="reviews-v1-placeholder-notice">
                This section needs a Google Place ID to load live reviews.
              </p>
            ) : null}
          </div>

          <RatingSummaryCard
            rating={displayRating}
            totalReviews={displayTotalReviews}
            onFetch={preview?.fetchReviews}
            isFetching={preview?.isFetching}
            fetchError={preview?.fetchError}
            showFetchButton={isPlayground}
            googleFetchCount={googleFetchCount}
            placeholderMode={usePlaceholders}
          />
        </div>

        <div className="reviews-v1-marquee-wrap">
          <div className="reviews-v1-marquee-fade reviews-v1-marquee-fade--left" aria-hidden="true" />
          <div className="reviews-v1-marquee-fade reviews-v1-marquee-fade--right" aria-hidden="true" />
          <div className="reviews-v1-marquee-viewport" role="region" aria-label="Google customer reviews">
            <div ref={trackRef} className="reviews-v1-marquee-track">
              {loopReviews.map((review, index) => (
                <ReviewCard key={`marquee-${index}`} review={review} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
