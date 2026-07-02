"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTextImagePreview } from "@/components/dev/TextImagePreviewContext";
import { Container } from "@/components/ui/Container";
import {
  defaultTextImagePreviewSettings,
  pickTextImageButtonSettings,
} from "@/lib/text-image-preview";
import { getButtonPreviewStyleRecord } from "@/lib/button-preview";
import { cn } from "@/lib/utils";

export type TextImageV1Props = {
  eyebrow: string;
  headlineLines: string[];
  body: string;
  phoneLabel: string;
  phoneHref: string;
  imageSrc: string;
  imageAlt: string;
  sidebarText: string;
  className?: string;
};

/** 50/50 text and image content block with phone CTA. */
export function TextImageV1({
  eyebrow,
  headlineLines,
  body,
  phoneLabel,
  phoneHref,
  imageSrc,
  imageAlt,
  sidebarText,
  className,
}: TextImageV1Props) {
  const preview = useTextImagePreview();
  const settings = preview?.settings ?? defaultTextImagePreviewSettings;
  const isCustom = Boolean(preview);
  const buttonSettings = pickTextImageButtonSettings(settings);
  const [imageVisible, setImageVisible] = useState(
    () => !settings.entranceAnimationEnabled,
  );

  const sectionStyle: CSSProperties = {
    backgroundColor: settings.backgroundColor,
  };

  const buttonStyle: CSSProperties | undefined = isCustom
    ? getButtonPreviewStyleRecord(buttonSettings)
    : undefined;

  useEffect(() => {
    if (!settings.entranceAnimationEnabled) {
      setImageVisible(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setImageVisible(true);
      return;
    }

    setImageVisible(false);
    const timer = window.setTimeout(() => setImageVisible(true), 100);
    return () => window.clearTimeout(timer);
  }, [settings.entranceAnimationEnabled, settings.entranceAnimationSpeedMs]);

  const imageWrapStyle: CSSProperties | undefined = settings.entranceAnimationEnabled
    ? {
        opacity: imageVisible ? 1 : 0,
        transition: `opacity ${settings.entranceAnimationSpeedMs}ms ease-out`,
      }
    : undefined;

  return (
    <section className={cn("text-image-v1 py-14 lg:py-20", className)} style={sectionStyle}>
      <Container>
        <div
          className={cn(
            "text-image-v1-grid grid items-start gap-10 lg:grid-cols-2 lg:gap-14",
            settings.layoutInverted && "text-image-v1-grid--inverted",
          )}
        >
          <div className="text-image-v1-copy">
            <p
              className="text-image-v1-eyebrow text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm"
              style={{ color: settings.eyebrowColor }}
            >
              {eyebrow}
            </p>
            <div className="mt-4 space-y-2">
              {headlineLines.map((line, index) => (
                <h2
                  key={`${line}-${index}`}
                  className={cn(
                    "text-image-v1-headline font-serif text-3xl font-semibold uppercase leading-tight sm:text-4xl lg:text-[2.5rem]",
                    index === 0 && "italic",
                  )}
                  style={{ color: settings.headlineColor }}
                >
                  {line}
                </h2>
              ))}
            </div>
            <p
              className="text-image-v1-body mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: settings.bodyColor }}
            >
              {body}
            </p>
            <a
              href={phoneHref}
              className={cn(
                "text-image-v1-phone-btn radial-hover-shine mt-8 inline-flex items-center justify-center font-semibold transition-colors",
                isCustom && "text-image-v1-phone-btn--custom",
              )}
              style={buttonStyle}
              data-nav-button-size={buttonSettings.navButtonSize}
            >
              <span className="relative z-[1]">{phoneLabel}</span>
            </a>
          </div>

          <div className="text-image-v1-media">
            <div
              className="text-image-v1-image-wrap overflow-hidden rounded-lg"
              style={imageWrapStyle}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={960}
                height={720}
                className="h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <p
              className="text-image-v1-sidebar mt-6 text-base leading-relaxed sm:text-lg"
              style={{ color: settings.sidebarTextColor }}
            >
              {sidebarText}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
