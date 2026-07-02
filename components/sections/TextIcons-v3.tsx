"use client";

import type { CSSProperties } from "react";
import { useTextIconsV3Preview } from "@/components/dev/TextIconsV3PreviewContext";
import { Container } from "@/components/ui/Container";
import {
  defaultTextIconsV3PreviewSettings,
  getTextIconsV3BackgroundStyle,
  getTextIconsV3CssVariables,
} from "@/lib/text-icons-v3-preview";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

export type TextIconsV3Item = {
  title: string;
  description: string;
};

type TextIconsV3Props = {
  heading: string;
  subheading: string;
  items: TextIconsV3Item[];
  className?: string;
};

function IconPlaceholder() {
  return (
    <div
      className="text-icons-v3-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 2 4 7v10l8 5 8-5V7l-8-5zm0 2.18 6 3.75v7.14l-6 3.75-6-3.75V7.93l6-3.75z" />
      </svg>
    </div>
  );
}

/** Four-column icon + text grid — Spartan "Why Choose Us" content block. */
export function TextIconsV3({ heading, subheading, items, className }: TextIconsV3Props) {
  const preview = useTextIconsV3Preview();
  const settings = preview?.settings ?? defaultTextIconsV3PreviewSettings;
  const isContained = settings.layoutWidth === "contained";

  const gradientBackground = getTextIconsV3BackgroundStyle(settings);
  const textStyle = getTextIconsV3CssVariables(settings) as CSSProperties;

  const content = (
    <>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-icons-v3-heading font-serif text-3xl font-semibold tracking-wide sm:text-4xl">
          {heading}
        </h2>
        <p className="text-icons-v3-subheading mt-4 text-sm leading-relaxed sm:text-base">
          {subheading}
        </p>
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
        {items.map((item) => (
          <article key={item.title} className="text-icons-v3-item flex flex-col items-center text-center">
            <IconPlaceholder />
            <h3 className="mt-5 text-lg font-semibold leading-snug text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{item.description}</p>
          </article>
        ))}
      </div>
    </>
  );

  if (isContained) {
    const sectionStyle: CSSProperties = {
      backgroundColor: settings.outerBackgroundColor,
      ...textStyle,
    };

    const innerStyle: CSSProperties = {
      background: gradientBackground,
    };

    return (
      <section className={cn("text-icons-v3", className)} style={sectionStyle}>
        <div className={getSiteLayoutWidthClassName("contained")}>
          <div className="py-16 lg:py-20" style={innerStyle}>
            {content}
          </div>
        </div>
      </section>
    );
  }

  const sectionStyle: CSSProperties = {
    background: gradientBackground,
    ...textStyle,
  };

  return (
    <section className={cn("text-icons-v3 py-16 lg:py-20", className)} style={sectionStyle}>
      <Container>{content}</Container>
    </section>
  );
}
