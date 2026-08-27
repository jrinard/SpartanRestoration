"use client";

import type { CSSProperties } from "react";
import { useHeroV1Preview } from "@/components/dev/HeroV1PreviewContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type HeroV1Props = {
  headline: string;
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HeroV1({ headline, subtext, ctaLabel, ctaHref }: HeroV1Props) {
  const preview = useHeroV1Preview();
  const displayHeadline = preview?.settings.headline ?? headline;
  const displaySubtext = preview?.settings.subtext ?? subtext;
  const displayCtaLabel = preview?.settings.ctaLabel ?? ctaLabel;
  const buttonColor = preview?.settings.buttonColor;

  const buttonStyle: CSSProperties | undefined = buttonColor
    ? {
        backgroundColor: buttonColor,
        color: "#ffffff",
        borderColor: buttonColor,
      }
    : undefined;

  return (
    <section className="py-24 lg:py-32">
      <Container className="text-center">
        <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {displayHeadline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{displaySubtext}</p>
        {displayCtaLabel && ctaHref && (
          <div className="mt-10">
            <a href={ctaHref}>
              <Button
                size="lg"
                className={cn(buttonColor && "preview-button--custom shadow-none")}
                style={buttonStyle}
              >
                {displayCtaLabel}
              </Button>
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}
