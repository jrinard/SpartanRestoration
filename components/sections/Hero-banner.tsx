"use client";

import { useEffect, useState } from "react";
import { useHeroBannerPreview } from "@/components/dev/HeroBannerPreviewContext";
import {
  defaultHeroBannerPreviewSettings,
  type HeroBannerSlide,
} from "@/lib/hero-banner-preview";
import {
  defaultHeroV21BackgroundSettings,
  getHeroV21BackgroundStyle,
} from "@/lib/hero-v21-background-preview";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

function HeroBannerSlideFill({ slide }: { slide: HeroBannerSlide }) {
  if (slide.type === "image") {
    return (
      <div
        className="hero-banner-slide-fill"
        style={{
          backgroundImage: `url(${slide.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }

  return <div className="hero-banner-slide-fill" style={{ backgroundColor: slide.value }} />;
}

/**
 * Full-width rotating banner — image and color slides with optional gradient overlay.
 */
export function HeroBanner() {
  const preview = useHeroBannerPreview();
  const settings = preview?.settings ?? defaultHeroBannerPreviewSettings;
  const { slides, intervalMs, transition } = settings;
  const backgroundSettings = settings.background ?? defaultHeroV21BackgroundSettings;
  const backgroundStyle = preview ? getHeroV21BackgroundStyle(backgroundSettings) : undefined;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [transition, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, slides.length]);

  return (
    <section
      className="hero-banner relative overflow-hidden"
      style={{ "--hero-banner-height": `${settings.heightPx}px` } as CSSProperties}
      aria-label="Homepage banner slideshow"
      aria-roledescription="carousel"
    >
      <h2 className="sr-only">Banner slideshow</h2>

      {transition === "fade" ? (
        <div className="hero-banner-slides hero-banner-slides--fade" aria-live="off">
          {slides.map((slide, index) => (
            <div
              key={`${slide.type}-${slide.value}-${index}`}
              className={cn("hero-banner-slide", index === activeIndex && "is-active")}
              aria-hidden={index !== activeIndex}
            >
              <HeroBannerSlideFill slide={slide} />
            </div>
          ))}
        </div>
      ) : (
        <div className="hero-banner-slides hero-banner-slides--slide" aria-live="off">
          <div
            className="hero-banner-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={`${slide.type}-${slide.value}-${index}`}
                className="hero-banner-slide"
                aria-hidden={index !== activeIndex}
              >
                <HeroBannerSlideFill slide={slide} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "hero-banner-overlay pointer-events-none absolute inset-0 z-[2]",
          preview && "hero-banner-overlay--preview",
        )}
        style={backgroundStyle}
        aria-hidden="true"
      />

      {slides.length > 1 && (
        <div
          className="hero-banner-dots"
          role="tablist"
          aria-label="Banner slides"
        >
          {slides.map((slide, index) => (
            <button
              key={`${slide.type}-${slide.value}-${index}-dot`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to slide ${index + 1}`}
              className={cn("hero-banner-dot", index === activeIndex && "is-active")}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
