"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReviewboxPreview } from "@/components/dev/ReviewboxPreviewContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  getHeroV21BackgroundStyle,
} from "@/lib/hero-v21-background-preview";
import { defaultReviewboxPreviewSettings } from "@/lib/reviewbox-preview";
import { cn } from "@/lib/utils";

export type ReviewboxShowcaseImage = {
  imageSrc?: string;
  imageAlt?: string;
  label?: string;
};

type ReviewboxV1Props = {
  logoSrc?: string;
  logoAlt?: string;
  eyebrow?: string;
  headlineLines: string[];
  subtext: string;
  productLink?: { label: string; href: string };
  bullets?: string[];
  /** Compact product capability tags shown below the main bullets. */
  features?: string[];
  featuresLabel?: string;
  ctaLabel: string;
  ctaSubtext?: string;
  ctaHref: string;
  desktop: ReviewboxShowcaseImage;
  leftExample: ReviewboxShowcaseImage;
  rightMessage: ReviewboxShowcaseImage;
};

type ShowcaseFrameProps = ReviewboxShowcaseImage & {
  variant: "desktop" | "mobile" | "horizontal";
  className?: string;
};

function MockDesktopChrome() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-background/80 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-accent-purple/35" />
        <span className="h-2 w-2 rounded-full bg-accent-blue/35" />
        <span className="h-2 w-2 rounded-full bg-border" />
        <span className="ml-2 h-2 flex-1 rounded bg-border/50" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-3 w-2/5 rounded bg-foreground/10" />
        <div className="h-2 w-full rounded bg-muted/20" />
        <div className="h-2 w-11/12 rounded bg-muted/20" />
        <div className="mt-auto grid grid-cols-3 gap-2">
          <div className="aspect-[4/3] rounded-md bg-accent-blue/10" />
          <div className="aspect-[4/3] rounded-md bg-accent-purple/10" />
          <div className="aspect-[4/3] rounded-md bg-accent-blue/10" />
        </div>
      </div>
    </div>
  );
}

function MockMobileChrome() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-center py-2">
        <span className="h-1 w-8 rounded-full bg-border" />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pb-4">
        <div className="h-2.5 w-2/3 rounded bg-foreground/10" />
        <div className="h-2 w-full rounded bg-muted/20" />
        <div className="mt-2 aspect-[5/4] rounded-lg bg-accent-purple/10" />
        <div className="h-2 w-4/5 rounded bg-muted/20" />
        <div className="mt-auto h-8 rounded-full bg-accent-blue/15" />
      </div>
    </div>
  );
}

function ShowcaseFrame({ variant, imageSrc, imageAlt, label, className }: ShowcaseFrameProps) {
  const aspectClass =
    variant === "mobile"
      ? "aspect-[9/16]"
      : variant === "horizontal"
        ? "aspect-[16/10]"
        : "aspect-[16/10]";

  return (
    <div
      className={cn(
        "reviewbox-showcase-frame overflow-hidden rounded-xl border-2 border-border bg-surface/50 shadow-lg",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-subtle-from to-subtle-to",
          aspectClass,
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? label ?? "Reviewbox preview"}
            fill
            className="object-cover object-top"
            sizes={variant === "mobile" ? "160px" : "480px"}
          />
        ) : (
          <>
            {variant === "mobile" ? <MockMobileChrome /> : <MockDesktopChrome />}
            {label && (
              <span className="absolute bottom-3 left-3 rounded bg-background/80 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted uppercase backdrop-blur-sm">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReviewboxShowcase({
  desktop,
  leftExample,
  rightMessage,
}: Pick<ReviewboxV1Props, "desktop" | "leftExample" | "rightMessage">) {
  return (
    <div className="reviewbox-showcase relative mx-auto w-full lg:max-w-none">
      <div className="relative">
        <div className="relative z-20 w-[86%] sm:w-[88%]">
          <ShowcaseFrame
            variant="desktop"
            {...desktop}
            className="shadow-xl ring-1 ring-accent-purple/10"
          />
        </div>

        <div className="relative z-10 mt-2.5 w-[52%] sm:w-[55%]">
          <ShowcaseFrame variant="horizontal" {...leftExample} className="shadow-md" />
        </div>

        <div className="absolute right-0 bottom-0 z-30 w-[34%] sm:w-[32%]">
          <ShowcaseFrame variant="mobile" {...rightMessage} className="shadow-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Reviewbox product feature — CTA-style copy left, layered device previews right.
 */
export function ReviewboxV1({
  logoSrc,
  logoAlt = "Reviewbox",
  eyebrow = "Reviewbox.io",
  headlineLines,
  subtext,
  productLink,
  bullets,
  features,
  featuresLabel = "Also includes",
  ctaLabel,
  ctaSubtext,
  ctaHref,
  desktop,
  leftExample,
  rightMessage,
}: ReviewboxV1Props) {
  const preview = useReviewboxPreview();
  const theme = preview?.settings.theme ?? defaultReviewboxPreviewSettings.theme;
  const backgroundSettings =
    preview?.settings.background ?? defaultReviewboxPreviewSettings.background;
  const backgroundStyle = preview
    ? getHeroV21BackgroundStyle(backgroundSettings)
    : undefined;
  const previewTextStyle: CSSProperties | undefined = preview
    ? ({
        "--reviewbox-title-color": preview.settings.titleColor,
        "--reviewbox-body-color": preview.settings.bodyColor,
      } as CSSProperties)
    : undefined;

  return (
    <section
      id="reviewbox"
      className={cn(
        "reviewbox-v1 relative scroll-mt-24 overflow-hidden pt-[calc(3.5rem-15px)] pb-[calc(5rem-15px)] lg:pt-[calc(4rem-15px)] lg:pb-[calc(6rem-15px)]",
        preview && "reviewbox-v1--preview-colors",
      )}
      data-reviewbox-theme={theme}
      style={previewTextStyle}
      aria-labelledby="reviewbox-heading"
    >
      <div
        className={cn(
          "reviewbox-v1-bg pointer-events-none absolute inset-0",
          preview && "reviewbox-v1-bg--preview",
        )}
        style={backgroundStyle}
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={logoAlt}
                width={220}
                height={64}
                className="reviewbox-v1-logo h-12 w-auto sm:h-14"
              />
            ) : (
              <p className="font-mono text-sm tracking-widest text-accent-purple uppercase">
                {eyebrow}
              </p>
            )}
            <h2
              id="reviewbox-heading"
              className="reviewbox-v1-title mt-3 font-serif text-4xl font-light leading-[1.08] tracking-tight text-foreground sm:text-5xl"
            >
              {headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="reviewbox-v1-body mt-6 text-base leading-relaxed text-muted sm:text-lg">
              {productLink ? (
                <>
                  <a
                    href={productLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reviewbox-v1-body-link font-medium underline decoration-accent-purple/40 underline-offset-4 transition-colors hover:text-accent-purple"
                  >
                    {productLink.label}
                  </a>{" "}
                  {subtext}
                </>
              ) : (
                subtext
              )}
            </p>
            {bullets && bullets.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {bullets.map((bullet) => (
                  <li key={bullet} className="reviewbox-v1-bullet flex items-start gap-2.5 text-sm text-foreground sm:text-base">
                    <span
                      className="reviewbox-v1-bullet-dot mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-purple"
                      aria-hidden="true"
                    />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
            {features && features.length > 0 && (
              <div className="mt-6 border-t border-border/60 pt-5">
                <p className="reviewbox-v1-features-label font-mono text-[0.65rem] tracking-widest text-muted uppercase">
                  {featuresLabel}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="reviewbox-v1-feature-pill rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-foreground sm:text-sm"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-8">
              <Link href={ctaHref} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="ghost"
                  className="reviewbox-signup-btn border-0 text-neutral-900 focus-visible:ring-[#f0bd4e]/60"
                >
                  {ctaLabel}
                </Button>
              </Link>
              {ctaSubtext && (
                <p className="reviewbox-v1-cta-subtext mt-2 text-center text-xs sm:text-left">{ctaSubtext}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <ReviewboxShowcase
              desktop={desktop}
              leftExample={leftExample}
              rightMessage={rightMessage}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
