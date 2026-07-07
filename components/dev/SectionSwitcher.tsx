"use client";

import { useState, type ReactNode } from "react";
import {
  NavBarPreviewProvider,
  NavBarPreviewControls,
} from "@/components/dev/NavBarPreviewContext";
import { NavBarLinksControls } from "@/components/dev/NavBarLinksControls";
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
  ServicesIconsV2PreviewProvider,
  ServicesIconsV2PreviewControls,
} from "@/components/dev/ServicesIconsV2PreviewContext";
import {
  ServiceAreaV1PreviewProvider,
  ServiceAreaV1PreviewControls,
} from "@/components/dev/ServiceAreaV1PreviewContext";
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
import { ContactV1PreviewControls } from "@/components/dev/ContactV1PreviewContext";
import {
  CtaV1PreviewProvider,
  CtaV1PreviewControls,
} from "@/components/dev/CtaV1PreviewContext";
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
import {
  TextImagesPreviewProvider,
  TextImagesPreviewControls,
} from "@/components/dev/TextImagesPreviewContext";
import { headerVariantUsesPreviewControls } from "@/lib/header-v3-gradient";
import {
  getSectionVariant,
  resolveSectionVariantId,
  sectionGroups,
  type SectionGroupId,
} from "@/lib/section-registry";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
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
  const isCtaV1 = group === "cta" && activeVariantId === "cta-v1";
  const isTextIconsV3 = group === "content" && activeVariantId === "text-icons-v3";
  const isTextImageV1 = group === "content" && activeVariantId === "text-image-v1";
  const isTextImagesV1 = group === "content" && activeVariantId === "text-images-v1";
  const isServicesIconsV2 = group === "services" && activeVariantId === "servicesIcons-v2";
  const isServiceAreaV1 = group === "services" && activeVariantId === "service-area-v1";
  const playground = useOptionalPlaygroundSections();
  const navReadOnly = isNavBar && Boolean(playground?.activePage && !playground.activePage.isHome);
  const switcherSectionLabel = isNavBar ? activeVariant.label : section.label;

  const switcher = (
    <div
      className={cn(
        "relative bg-transparent",
        isSpacer && "section-switcher-spacer",
        navReadOnly && "section-switcher-nav-readonly",
        className,
      )}
    >
      <div className="section-switcher-controls relative z-20 flex w-full min-w-0 flex-wrap items-center gap-x-3.5 gap-y-2 px-6 py-1.5 lg:px-8">
        <span className="section-switcher-label shrink-0 font-mono text-sm tracking-widest text-accent-purple uppercase">
          {switcherSectionLabel}
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
          disabled={navReadOnly}
          className={cn(
            "section-switcher-select shrink-0 rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none",
            navReadOnly && "cursor-not-allowed opacity-50",
          )}
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
        {isServicesIconsV2 && <ServicesIconsV2PreviewControls />}
        {isServiceAreaV1 && <ServiceAreaV1PreviewControls />}
        {group === "spacer" &&
          (activeVariantId === "spacer-v1" || activeVariantId === "spacer-v2") && (
            <SpacerStripePreviewControls variantId={activeVariantId} />
          )}
        {group === "spacer" &&
          (activeVariantId === "spacer-v3" || activeVariantId === "spacer-v4") && (
            <SpacerContainedLayoutControls />
          )}
        {isTopBar && <TopBarPreviewControls />}
        {isNavBar && navReadOnly && (
          <span className="font-mono text-xs tracking-wide text-accent-purple/70 italic">
            Preview only — edit nav on Home
          </span>
        )}
        {isNavBar && !navReadOnly && (
          <>
            <NavBarPreviewControls />
            <NavBarLinksControls />
          </>
        )}
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
        {isCtaV1 && <CtaV1PreviewControls />}
        {isTextIconsV3 && <TextIconsV3BackgroundControls />}
        {isTextImageV1 && <TextImagePreviewControls />}
        {isTextImagesV1 && <TextImagesPreviewControls />}
        {extraControls?.(activeVariantId)}
      </div>
      <div className="relative">
        <div
          className={cn(
            navReadOnly && "pointer-events-none opacity-45 saturate-50",
          )}
          aria-hidden={navReadOnly || undefined}
        >
          {activeVariant.render()}
        </div>
        {navReadOnly && (
          <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center font-mono text-xs tracking-wide text-accent-purple/80 uppercase lg:text-sm">
            Global nav — edit on Home
          </p>
        )}
      </div>
    </div>
  );

  if (isServicesIconsV2) {
    return (
      <ServicesIconsV2PreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </ServicesIconsV2PreviewProvider>
    );
  }

  if (isServiceAreaV1) {
    return (
      <ServiceAreaV1PreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </ServiceAreaV1PreviewProvider>
    );
  }

  if (group === "services") {
    return <ServicesV1LayoutProvider instanceId={sectionId}>{switcher}</ServicesV1LayoutProvider>;
  }

  if (group === "spacer") {
    return (
      <SpacerStripePreviewProvider instanceId={sectionId} variantId={activeVariantId}>
        {switcher}
      </SpacerStripePreviewProvider>
    );
  }

  if (isTopBar) {
    return <TopBarPreviewProvider instanceId={sectionId}>{switcher}</TopBarPreviewProvider>;
  }

  if (isNavBar) {
    return (
      <NavBarPreviewProvider instanceId={sectionId} editingEnabled={!navReadOnly}>
        {switcher}
      </NavBarPreviewProvider>
    );
  }

  if (isHeaderWithPreview) {
    return (
      <HeaderV3PreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </HeaderV3PreviewProvider>
    );
  }

  if (isHeroV1) {
    return <HeroV1PreviewProvider instanceId={sectionId}>{switcher}</HeroV1PreviewProvider>;
  }

  if (isHeroBanner) {
    return <HeroBannerPreviewProvider instanceId={sectionId}>{switcher}</HeroBannerPreviewProvider>;
  }

  if (isHeroV21) {
    return <HeroV21PreviewProvider instanceId={sectionId}>{switcher}</HeroV21PreviewProvider>;
  }

  if (isPortfolioV1) {
    return <PortfolioPreviewProvider instanceId={sectionId}>{switcher}</PortfolioPreviewProvider>;
  }

  if (isFooterV3) {
    return <FooterV3PreviewProvider instanceId={sectionId}>{switcher}</FooterV3PreviewProvider>;
  }

  if (isFooterV1) {
    return <FooterV1PreviewProvider instanceId={sectionId}>{switcher}</FooterV1PreviewProvider>;
  }

  if (isReviewboxV1) {
    return <ReviewboxPreviewProvider instanceId={sectionId}>{switcher}</ReviewboxPreviewProvider>;
  }

  if (isContactV1) {
    return switcher;
  }

  if (isCtaV1) {
    return (
      <CtaV1PreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </CtaV1PreviewProvider>
    );
  }

  if (isTextIconsV3) {
    return (
      <TextIconsV3PreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </TextIconsV3PreviewProvider>
    );
  }

  if (isTextImageV1) {
    return (
      <TextImagePreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </TextImagePreviewProvider>
    );
  }

  if (isTextImagesV1) {
    return (
      <TextImagesPreviewProvider instanceId={sectionId} enableContentEditing>
        {switcher}
      </TextImagesPreviewProvider>
    );
  }

  return switcher;
}
