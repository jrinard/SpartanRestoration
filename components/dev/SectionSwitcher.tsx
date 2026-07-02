"use client";

import { useState, type ReactNode } from "react";
import {
  NavBarPreviewProvider,
  NavBarPreviewControls,
} from "@/components/dev/NavBarPreviewContext";
import {
  TopBarPreviewProvider,
  TopBarPreviewControls,
} from "@/components/dev/TopBarPreviewContext";
import {
  HeaderV3PreviewProvider,
  HeaderV3PreviewControls,
} from "@/components/dev/HeaderV3PreviewContext";
import { HeroBannerPreviewProvider, HeroBannerPreviewControls } from "@/components/dev/HeroBannerPreviewContext";
import { HeroV1PreviewProvider, HeroV1PreviewControls } from "@/components/dev/HeroV1PreviewContext";
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
  FooterV1PreviewProvider,
  FooterV1PreviewControls,
} from "@/components/dev/FooterV1PreviewContext";
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
  SpacerContainedLayoutControls,
} from "@/components/dev/SpacerStripePreviewContext";
import {
  TextIconsV3PreviewProvider,
  TextIconsV3BackgroundControls,
} from "@/components/dev/TextIconsV3PreviewContext";
import {
  TextImagePreviewProvider,
  TextImagePreviewControls,
} from "@/components/dev/TextImagePreviewContext";
import { headerVariantUsesPreviewControls } from "@/lib/header-v3-gradient";
import {
  getSectionVariant,
  resolveSectionVariantId,
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
  const activeVariantId = resolveSectionVariantId(group, variant ?? variantId);
  const activeVariant = getSectionVariant(group, activeVariantId);
  const isSpacer = group === "spacer";
  const isTopBar = group === "topBar";
  const isNavBar = group === "nav";
  const isHeaderWithPreview =
    group === "header" && headerVariantUsesPreviewControls(activeVariantId);
  const isHeroV1 = group === "hero" && activeVariantId === "hero-v1";
  const isHeroBanner = group === "hero" && activeVariantId === "hero-banner";
  const isHeroV21 = group === "hero" && activeVariantId === "hero-v2.1";
  const isPortfolioV1 = group === "portfolio" && activeVariantId === "portfolio-v1";
  const isFooterV3 = group === "footer" && activeVariantId === "footer-v3";
  const isFooterV1 = group === "footer" && activeVariantId === "footer-v1";
  const isReviewboxV1 = group === "reviewbox" && activeVariantId === "reviewbox-v1";
  const isContactV1 = group === "contact" && activeVariantId === "contact-v1";
  const isTextIconsV3 = group === "content" && activeVariantId === "text-icons-v3";
  const isTextImageV1 = group === "content" && activeVariantId === "text-image-v1";

  const switcher = (
    <div
      className={cn(
        "relative bg-transparent",
        isSpacer && "section-switcher-spacer",
        className,
      )}
    >
      <div className="section-switcher-controls relative z-20 flex w-full min-w-0 flex-wrap items-center gap-x-3.5 gap-y-2 px-6 py-1.5 lg:px-8">
        <span className="section-switcher-label shrink-0 font-mono text-sm tracking-widest text-accent-purple uppercase">
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
          className="section-switcher-select shrink-0 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
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
        {group === "spacer" &&
          (activeVariantId === "spacer-v1" || activeVariantId === "spacer-v2") && (
            <SpacerStripePreviewControls variantId={activeVariantId} />
          )}
        {group === "spacer" &&
          (activeVariantId === "spacer-v3" || activeVariantId === "spacer-v4") && (
            <SpacerContainedLayoutControls />
          )}
        {isTopBar && <TopBarPreviewControls />}
        {isNavBar && <NavBarPreviewControls />}
        {isHeaderWithPreview && <HeaderV3PreviewControls variantId={activeVariantId} />}
        {isHeroV1 && <HeroV1PreviewControls />}
        {isHeroBanner && <HeroBannerPreviewControls />}
        {isHeroV21 && (
          <>
            <HeroV21BackgroundControls />
            <ButtonPreviewControls target="hero" buttonOnlyReset />
          </>
        )}
        {isPortfolioV1 && <PortfolioPreviewControls />}
        {isFooterV3 && <FooterV3PreviewControls />}
        {isFooterV1 && <FooterV1PreviewControls />}
        {isReviewboxV1 && <ReviewboxBackgroundControls />}
        {isContactV1 && <ContactV1PreviewControls />}
        {isTextIconsV3 && <TextIconsV3BackgroundControls />}
        {isTextImageV1 && <TextImagePreviewControls />}
        {extraControls?.(activeVariantId)}
      </div>
      {activeVariant.render()}
    </div>
  );

  if (group === "services") {
    return <ServicesV1LayoutProvider>{switcher}</ServicesV1LayoutProvider>;
  }

  if (group === "spacer") {
    return (
      <SpacerStripePreviewProvider instanceId={sectionId} variantId={activeVariantId}>
        {switcher}
      </SpacerStripePreviewProvider>
    );
  }

  if (isTopBar) {
    return <TopBarPreviewProvider>{switcher}</TopBarPreviewProvider>;
  }

  if (isNavBar) {
    return <NavBarPreviewProvider>{switcher}</NavBarPreviewProvider>;
  }

  if (isHeaderWithPreview) {
    return <HeaderV3PreviewProvider>{switcher}</HeaderV3PreviewProvider>;
  }

  if (isHeroV1) {
    return <HeroV1PreviewProvider>{switcher}</HeroV1PreviewProvider>;
  }

  if (isHeroBanner) {
    return <HeroBannerPreviewProvider>{switcher}</HeroBannerPreviewProvider>;
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

  if (isFooterV1) {
    return <FooterV1PreviewProvider>{switcher}</FooterV1PreviewProvider>;
  }

  if (isReviewboxV1) {
    return <ReviewboxPreviewProvider>{switcher}</ReviewboxPreviewProvider>;
  }

  if (isTextIconsV3) {
    return (
      <TextIconsV3PreviewProvider instanceId={sectionId}>{switcher}</TextIconsV3PreviewProvider>
    );
  }

  if (isTextImageV1) {
    return (
      <TextImagePreviewProvider instanceId={sectionId}>{switcher}</TextImagePreviewProvider>
    );
  }

  return switcher;
}
