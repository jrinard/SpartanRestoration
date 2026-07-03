"use client";

import { TopBarPreviewProvider } from "@/components/dev/TopBarPreviewContext";
import { NavBarPreviewProvider } from "@/components/dev/NavBarPreviewContext";
import { HeroBannerPreviewProvider } from "@/components/dev/HeroBannerPreviewContext";
import { HeroV1PreviewProvider } from "@/components/dev/HeroV1PreviewContext";
import { HeroV21PreviewProvider } from "@/components/dev/HeroV21PreviewContext";
import { HeaderV3PreviewProvider } from "@/components/dev/HeaderV3PreviewContext";
import { PortfolioPreviewProvider } from "@/components/dev/PortfolioPreviewContext";
import { FooterV3PreviewProvider } from "@/components/dev/FooterV3PreviewContext";
import { FooterV1PreviewProvider } from "@/components/dev/FooterV1PreviewContext";
import { ReviewboxPreviewProvider } from "@/components/dev/ReviewboxPreviewContext";
import { ServicesV1LayoutProvider } from "@/components/dev/ServicesV1LayoutContext";
import { ServicesIconsV2PreviewProvider } from "@/components/dev/ServicesIconsV2PreviewContext";
import { SpacerStripePreviewProvider } from "@/components/dev/SpacerStripePreviewContext";
import { TextIconsV3PreviewProvider } from "@/components/dev/TextIconsV3PreviewContext";
import { TextImagePreviewProvider } from "@/components/dev/TextImagePreviewContext";
import { headerVariantUsesPreviewControls } from "@/lib/header-v3-gradient";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import {
  getSectionVariant,
  sectionGroups,
  type SectionGroupId,
  resolveSectionVariantId,
} from "@/lib/section-registry";

type SectionPreviewProps = {
  group: SectionGroupId;
  variant?: string;
  sectionId?: string;
  previewSettings?: HomepagePreviewSettings;
};

/** Renders a section variant with no playground controls. */
export function SectionPreview({ group, variant, sectionId, previewSettings }: SectionPreviewProps) {
  const section = sectionGroups[group];
  const variantId = resolveSectionVariantId(group, variant ?? section.defaultVariant);
  const activeVariant = getSectionVariant(group, variantId);
  const content = activeVariant.render();

  if (group === "topBar") {
    return (
      <TopBarPreviewProvider initialSettings={previewSettings?.topBar}>
        {content}
      </TopBarPreviewProvider>
    );
  }

  if (group === "nav") {
    return (
      <NavBarPreviewProvider initialSettings={previewSettings?.navBar}>
        {content}
      </NavBarPreviewProvider>
    );
  }

  if (group === "services" && variantId === "servicesIcons-v2") {
    return (
      <ServicesIconsV2PreviewProvider initialSettings={previewSettings?.servicesIconsV2}>
        {content}
      </ServicesIconsV2PreviewProvider>
    );
  }

  if (group === "services") {
    return <ServicesV1LayoutProvider>{content}</ServicesV1LayoutProvider>;
  }

  if (group === "spacer") {
    const spacerSettings =
      (sectionId && previewSettings?.spacers?.[sectionId]) ||
      (!sectionId && previewSettings?.spacerStripe
        ? {
            stripe: previewSettings.spacerStripe,
            gradient: previewSettings.spacerGradient,
          }
        : undefined);

    return (
      <SpacerStripePreviewProvider
        instanceId={sectionId}
        variantId={variantId}
        initialSettings={spacerSettings}
      >
        {content}
      </SpacerStripePreviewProvider>
    );
  }

  if (group === "header" && headerVariantUsesPreviewControls(variantId)) {
    return (
      <HeaderV3PreviewProvider initialSettings={previewSettings?.headerV3}>
        {content}
      </HeaderV3PreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-banner") {
    return (
      <HeroBannerPreviewProvider initialSettings={previewSettings?.heroBanner}>
        {content}
      </HeroBannerPreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-v1") {
    return (
      <HeroV1PreviewProvider initialSettings={previewSettings?.heroV1}>
        {content}
      </HeroV1PreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-v2.1") {
    return <HeroV21PreviewProvider>{content}</HeroV21PreviewProvider>;
  }

  if (group === "portfolio" && variantId === "portfolio-v1") {
    return (
      <PortfolioPreviewProvider initialSettings={previewSettings?.portfolio}>
        {content}
      </PortfolioPreviewProvider>
    );
  }

  if (group === "footer" && variantId === "footer-v3") {
    return (
      <FooterV3PreviewProvider initialSettings={previewSettings?.footerV3}>
        {content}
      </FooterV3PreviewProvider>
    );
  }

  if (group === "footer" && variantId === "footer-v1") {
    return (
      <FooterV1PreviewProvider initialSettings={previewSettings?.footerV1}>
        {content}
      </FooterV1PreviewProvider>
    );
  }

  if (group === "reviewbox" && variantId === "reviewbox-v1") {
    return <ReviewboxPreviewProvider>{content}</ReviewboxPreviewProvider>;
  }

  if (group === "content" && variantId === "text-icons-v3") {
    const instanceSettings =
      sectionId && previewSettings?.contents?.[sectionId]?.textIconsV3
        ? previewSettings.contents[sectionId].textIconsV3
        : previewSettings?.textIconsV3;

    return (
      <TextIconsV3PreviewProvider instanceId={sectionId} initialSettings={instanceSettings}>
        {content}
      </TextIconsV3PreviewProvider>
    );
  }

  if (group === "content" && variantId === "text-image-v1") {
    const instanceSettings =
      sectionId && previewSettings?.contents?.[sectionId]?.textImage
        ? previewSettings.contents[sectionId].textImage
        : previewSettings?.textImage;

    return (
      <TextImagePreviewProvider instanceId={sectionId} initialSettings={instanceSettings}>
        {content}
      </TextImagePreviewProvider>
    );
  }

  return content;
}
