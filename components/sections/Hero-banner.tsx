"use client";

import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { useHeroBannerPreview } from "@/components/dev/HeroBannerPreviewContext";
import {
  defaultHeroBannerPreviewSettings,
  type HeroBannerSlide,
} from "@/lib/hero-banner-preview";
import { normalizeHeroBannerPreviewSettings } from "@/lib/hero-banner-preview-storage";
import {
  defaultHeroV21BackgroundSettings,
  getHeroV21BackgroundStyle,
} from "@/lib/hero-v21-background-preview";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
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
  const contentEditingEnabled = preview?.contentEditingEnabled ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [transition, slides.length]);

  function replaceActiveSlideImage(src: string) {
    if (!preview) return;
    const normalized = normalizeHeroBannerPreviewSettings(preview.settings);
    const nextSlides = [...normalized.slides];
    if (nextSlides.length === 0) {
      nextSlides.push({ type: "image", value: src });
    } else {
      const index = Math.min(activeIndex, nextSlides.length - 1);
      nextSlides[index] = { type: "image", value: src };
    }
    preview.setSettings(normalizeHeroBannerPreviewSettings({ ...normalized, slides: nextSlides }));
  }

  useEffect(() => {
    setLibraryOpen(false);
  }, [activeIndex]);

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

      {contentEditingEnabled && activeSlide?.type === "image" ? (
        <>
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              className={cn(devLibraryPillClassName, "relative top-auto right-auto")}
              aria-label="Change banner image"
              aria-expanded={libraryOpen}
            >
              <Images size={devLibraryIconSize} strokeWidth={2} />
              <span className={devLibraryLabelClassName}>Image</span>
            </button>
          </div>
          {libraryOpen ? (
            <div className="absolute top-12 right-2 z-30">
              <ImageLibraryPicker
                value={activeSlide.value}
                onSelect={(entry) => {
                  replaceActiveSlideImage(entry.src);
                  setLibraryOpen(false);
                }}
                onClose={() => setLibraryOpen(false)}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
