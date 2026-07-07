"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { useHeroV21Preview } from "@/components/dev/HeroV21PreviewContext";
import { Container } from "@/components/ui/Container";
import { PreviewButton } from "@/components/ui/PreviewButton";
import {
  defaultHeroV21BackgroundSettings,
  getHeroV21BackgroundStyle,
} from "@/lib/hero-v21-background-preview";
import { isContactHref } from "@/lib/contact-modal";
import { scrollToHashHref } from "@/lib/scroll-to-hash";
import { cn } from "@/lib/utils";

export type HeroHighlight = {
  title: string;
  description: string;
  href?: string;
};

type HeroV21Props = {
  /** Multi-line headline — each entry renders as a block line */
  headlineLines: string[];
  /** Rotating subtext lines — cycles when more than one is provided */
  subtextLines: string[];
  highlights: HeroHighlight[];
  ctaLabel?: string;
  ctaHref?: string;
};

const SUBTEXT_HOLD_MS = 5000;

function RotatingSubtext({ lines }: { lines: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (lines.length <= 1) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % lines.length);
    }, SUBTEXT_HOLD_MS);

    return () => clearInterval(interval);
  }, [lines]);

  return (
    <p
      className="hero-v21-subtext mt-4 text-lg leading-relaxed text-muted"
      aria-live="polite"
      aria-atomic="true"
    >
      {lines.map((line, lineIndex) => (
        <span
          key={line}
          aria-hidden={lineIndex !== index}
          className={cn(
            "hero-v21-subtext-line block ease-in-out",
            lineIndex === index ? "relative z-10 opacity-100" : "absolute inset-x-0 top-0 opacity-0",
          )}
        >
          {line}
        </span>
      ))}
    </p>
  );
}

function HighlightCard({ title, description, href }: HeroHighlight) {
  const content = (
    <>
      <h2 className="font-serif text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{description}</p>
      {href && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-blue transition-colors group-hover:text-accent-blue-dark">
          Learn More
          <span aria-hidden="true">→</span>
        </span>
      )}
    </>
  );

  const className =
    "group flex flex-col rounded-xl border border-border bg-surface/50 p-5 transition-colors hover:border-accent-blue/30 hover:bg-surface";

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Learn more about ${title}`}
        onClick={(event) => {
          if (scrollToHashHref(href)) {
            event.preventDefault();
          }
        }}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * Split hero — tagline left, stacked service/product highlights right (no video required).
 */
export function HeroV21({
  headlineLines,
  subtextLines,
  highlights,
  ctaLabel,
  ctaHref,
}: HeroV21Props) {
  const preview = useHeroV21Preview();
  const modal = useContactModal();
  const backgroundSettings = preview?.settings.background ?? defaultHeroV21BackgroundSettings;
  const backgroundStyle = preview ? getHeroV21BackgroundStyle(backgroundSettings) : undefined;

  return (
    <section
      className="hero-v21 relative overflow-hidden pt-[calc(2.5rem-15px)] pb-[calc(4rem-15px)] lg:pt-[calc(3rem-15px)] lg:pb-[calc(5rem-15px)]"
      aria-labelledby="hero-heading"
    >
      <div
        className={cn("hero-v21-bg pointer-events-none absolute inset-0", preview && "hero-v21-bg--preview")}
        style={backgroundStyle}
        aria-hidden="true"
      />

      <Container className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h1
            id="hero-heading"
            className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            {headlineLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <RotatingSubtext lines={subtextLines} />
          {ctaLabel && ctaHref && (
            <div className="mt-6">
              <a
                href={ctaHref}
                aria-label={`${ctaLabel} — contact LifeSpring Design`}
                onClick={(event) => {
                  if (modal && isContactHref(ctaHref)) {
                    event.preventDefault();
                    modal.openContact();
                  }
                }}
              >
                <PreviewButton>{ctaLabel}</PreviewButton>
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4" role="list" aria-label="Featured services">
          {highlights.map((highlight) => (
            <div key={highlight.title} role="listitem">
              <HighlightCard {...highlight} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
