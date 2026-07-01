"use client";

import { useState, type ReactNode } from "react";
import {
  HeaderV3PreviewProvider,
  HeaderV3PreviewControls,
} from "@/components/dev/HeaderV3PreviewContext";
import { HeroV21PreviewProvider, HeroV21BackgroundControls } from "@/components/dev/HeroV21PreviewContext";
import { ButtonPreviewControls } from "@/components/dev/ButtonPreviewControls";
import {
  ServicesV1LayoutProvider,
  ServicesV1LayoutSelect,
  ServicesV1BackgroundSelects,
} from "@/components/dev/ServicesV1LayoutContext";
import {
  PortfolioPreviewProvider,
  PortfolioPreviewControls,
} from "@/components/dev/PortfolioPreviewContext";
import {
  FooterV3PreviewProvider,
  FooterV3PreviewControls,
} from "@/components/dev/FooterV3PreviewContext";
import {
  ReviewboxPreviewProvider,
  ReviewboxBackgroundControls,
} from "@/components/dev/ReviewboxPreviewContext";
import {
  ContactV1PreviewControls,
} from "@/components/dev/ContactV1PreviewContext";
import {
  SpacerStripePreviewProvider,
  SpacerStripePreviewControls,
  SpacerGradientPreviewControls,
} from "@/components/dev/SpacerStripePreviewContext";
import {
  getSectionVariant,
  sectionGroups,
  type SectionGroupId,
} from "@/lib/section-registry";
import { cn } from "@/lib/utils";

type SectionSwitcherProps = {
  group: SectionGroupId;
  sectionId?: string;
  defaultVariant?: string;
  variant?: string;
  onVariantChange?: (variantId: string) => void;
  className?: string;
  extraControls?: (variantId: string) => ReactNode;
};

/**
 * Preview-only section wrapper with a dropdown to swap component variants.
 */
export function SectionSwitcher({
  group,
  sectionId,
  defaultVariant,
  variant,
  onVariantChange,
  className,
  extraControls,
}: SectionSwitcherProps) {
  const section = sectionGroups[group];
  const initialVariant = defaultVariant ?? section.defaultVariant;
  const [variantId, setVariantId] = useState(initialVariant);
  const isControlled = onVariantChange !== undefined;
  const activeVariantId = variant ?? variantId;

  const activeVariant = getSectionVariant(group, activeVariantId);
  const isSpacer = group === "spacer";
  const isHeaderV3 = group === "header" && activeVariantId === "header-v3";
  const isHeroV21 = group === "hero" && activeVariantId === "hero-v2.1";
  const isPortfolioV1 = group === "portfolio" && activeVariantId === "portfolio-v1";
  const isFooterV3 = group === "footer" && activeVariantId === "footer-v3";
  const isReviewboxV1 = group === "reviewbox" && activeVariantId === "reviewbox-v1";
  const isContactV1 = group === "contact" && activeVariantId === "contact-v1";
  const usesButtonPreview = isHeaderV3 || isHeroV21;
  const usesExtraControls =
    usesButtonPreview || isPortfolioV1 || isFooterV3 || isReviewboxV1 || isContactV1;

  const switcher = (
    <div
      className={cn(
        "relative",
        isSpacer && "pt-9",
        usesExtraControls && "pt-14",
        className,
      )}
    >
      <label
        className={cn(
          "absolute left-6 z-20 flex flex-wrap items-center gap-2 lg:left-8",
          isSpacer || usesExtraControls ? "top-1.5" : "top-4",
        )}
      >
        <span className="section-switcher-label font-mono text-sm tracking-widest text-accent-purple uppercase">
          {section.label}
        </span>
        <select
          value={activeVariantId}
          onChange={(e) => {
            const nextVariant = e.target.value;
            if (isControlled) {
              onVariantChange?.(nextVariant);
            } else {
              setVariantId(nextVariant);
            }
          }}
          className="section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
        >
          {Object.entries(section.variants).map(([key, variant]) => (
            <option key={key} value={key}>
              {variant.label}
            </option>
          ))}
        </select>
        {group === "services" && activeVariantId === "services-v1" && (
          <>
            <ServicesV1LayoutSelect />
            <ServicesV1BackgroundSelects />
          </>
        )}
        {group === "spacer" && activeVariantId === "spacer-v1" && <SpacerStripePreviewControls />}
        {group === "spacer" && activeVariantId === "spacer-v2" && <SpacerGradientPreviewControls />}
        {isHeaderV3 && <HeaderV3PreviewControls />}
        {isHeroV21 && (
          <>
            <HeroV21BackgroundControls />
            <ButtonPreviewControls target="hero" buttonOnlyReset />
          </>
        )}
        {isPortfolioV1 && <PortfolioPreviewControls />}
        {isFooterV3 && <FooterV3PreviewControls />}
        {isReviewboxV1 && <ReviewboxBackgroundControls />}
        {isContactV1 && <ContactV1PreviewControls />}
        {extraControls?.(activeVariantId)}
      </label>
      {activeVariant.render()}
    </div>
  );

  if (group === "services") {
    return <ServicesV1LayoutProvider>{switcher}</ServicesV1LayoutProvider>;
  }

  if (group === "spacer") {
    return (
      <SpacerStripePreviewProvider instanceId={sectionId}>{switcher}</SpacerStripePreviewProvider>
    );
  }

  if (isHeaderV3) {
    return <HeaderV3PreviewProvider>{switcher}</HeaderV3PreviewProvider>;
  }

  if (isHeroV21) {
    return <HeroV21PreviewProvider>{switcher}</HeroV21PreviewProvider>;
  }

  if (isPortfolioV1) {
    return <PortfolioPreviewProvider>{switcher}</PortfolioPreviewProvider>;
  }

  if (isFooterV3) {
    return <FooterV3PreviewProvider>{switcher}</FooterV3PreviewProvider>;
  }

  if (isReviewboxV1) {
    return <ReviewboxPreviewProvider>{switcher}</ReviewboxPreviewProvider>;
  }

  return switcher;
}
