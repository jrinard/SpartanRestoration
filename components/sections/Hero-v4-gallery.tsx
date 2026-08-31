"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Images } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { useHeroV4Preview } from "@/components/dev/HeroV4PreviewContext";
import type { HeroBannerSlide } from "@/lib/hero-banner-preview";
import {
  defaultHeroV4GalleryHeightPx,
  normalizeHeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

function GallerySlideFill({ slide }: { slide: HeroBannerSlide }) {
  if (slide.type === "image") {
    return (
      <div
        className="hero-v4-gallery-slide-fill"
        style={{
          backgroundImage: `url(${slide.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      />
    );
  }

  return (
    <div className="hero-v4-gallery-slide-fill" style={{ backgroundColor: slide.value }} />
  );
}

type HeroV4GalleryProps = {
  slides?: HeroBannerSlide[];
  intervalMs?: number;
  transition?: "fade" | "slide";
  heightPx?: number;
  background?: string;
  radiusPx?: number;
  className?: string;
};

export function HeroV4Gallery({
  slides = [],
  intervalMs = 5000,
  transition = "fade",
  heightPx = defaultHeroV4GalleryHeightPx,
  background = "#000000",
  radiusPx = 20,
  className,
}: HeroV4GalleryProps) {
  const preview = useHeroV4Preview();
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const visibleSlides = slides.filter((slide) => slide.value.trim());

  useEffect(() => {
    setActiveIndex(0);
  }, [transition, visibleSlides.length]);

  useEffect(() => {
    if (visibleSlides.length <= 1) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleSlides.length);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, visibleSlides.length]);

  function replaceActiveSlide(src: string) {
    if (!preview) return;
    const settings = normalizeHeroV4PreviewSettings(preview.settings);
    const nextSlides = [...(settings.gallerySlides ?? [])];
    if (visibleSlides.length === 0) {
      nextSlides.push({ type: "image", value: src });
    } else {
      const current = visibleSlides[Math.min(activeIndex, visibleSlides.length - 1)];
      const index = (settings.gallerySlides ?? []).findIndex(
        (slide) => slide.type === current.type && slide.value === current.value,
      );
      if (index >= 0) {
        nextSlides[index] = { type: "image", value: src };
      } else {
        nextSlides.push({ type: "image", value: src });
      }
    }
    preview.setSettings(normalizeHeroV4PreviewSettings({ ...settings, gallerySlides: nextSlides }));
  }

  function addSlide(src: string) {
    if (!preview) return;
    const settings = normalizeHeroV4PreviewSettings(preview.settings);
    preview.setSettings(
      normalizeHeroV4PreviewSettings({
        ...settings,
        gallerySlides: [...(settings.gallerySlides ?? []), { type: "image", value: src }],
      }),
    );
  }

  return (
    <div
      className={cn("hero-v4-gallery-card relative overflow-hidden", className)}
      style={
        {
          "--hero-v4-gallery-height": `${heightPx}px`,
          "--hero-v4-gallery-bg": background,
          "--hero-v4-gallery-radius": radiusPx >= 999 ? "999px" : `${radiusPx}px`,
        } as CSSProperties
      }
      aria-label="Project gallery"
      aria-roledescription="carousel"
    >
      {visibleSlides.length === 0 ? (
        <div className="hero-v4-gallery-empty">
          {editingEnabled ? "Add gallery images" : null}
        </div>
      ) : transition === "fade" ? (
        <div className="hero-v4-gallery-slides hero-v4-gallery-slides--fade" aria-live="off">
          {visibleSlides.map((slide, index) => (
            <div
              key={`${slide.type}-${slide.value}-${index}`}
              className={cn("hero-v4-gallery-slide", index === activeIndex && "is-active")}
              aria-hidden={index !== activeIndex}
            >
              <GallerySlideFill slide={slide} />
            </div>
          ))}
        </div>
      ) : (
        <div className="hero-v4-gallery-slides hero-v4-gallery-slides--slide" aria-live="off">
          <div
            className="hero-v4-gallery-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {visibleSlides.map((slide, index) => (
              <div
                key={`${slide.type}-${slide.value}-${index}`}
                className="hero-v4-gallery-slide"
                aria-hidden={index !== activeIndex}
              >
                <GallerySlideFill slide={slide} />
              </div>
            ))}
          </div>
        </div>
      )}

      {visibleSlides.length > 1 ? (
        <div className="hero-v4-gallery-dots" role="tablist" aria-label="Gallery slides">
          {visibleSlides.map((slide, index) => (
            <button
              key={`${slide.type}-${slide.value}-${index}-dot`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to slide ${index + 1}`}
              className={cn("hero-v4-gallery-dot", index === activeIndex && "is-active")}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}

      {editingEnabled ? (
        <>
          <button
            type="button"
            onClick={() => setLibraryOpen((open) => !open)}
            className={devLibraryPillClassName}
            aria-label={visibleSlides.length ? "Change gallery image" : "Add gallery image"}
            aria-expanded={libraryOpen}
          >
            <Images size={devLibraryIconSize} strokeWidth={2} />
            <span className={devLibraryLabelClassName}>
              {visibleSlides.length ? "Image" : "Add"}
            </span>
          </button>
          {libraryOpen ? (
            <div className="absolute top-12 right-2 z-30">
              <ImageLibraryPicker
                value={visibleSlides[activeIndex]?.value}
                onSelect={(entry) => {
                  if (visibleSlides.length === 0) addSlide(entry.src);
                  else replaceActiveSlide(entry.src);
                  setLibraryOpen(false);
                }}
                onClose={() => setLibraryOpen(false)}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
