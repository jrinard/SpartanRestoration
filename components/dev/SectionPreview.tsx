"use client";

import { TopBarPreviewProvider } from "@/components/dev/TopBarPreviewContext";
import { NavBarPreviewProvider } from "@/components/dev/NavBarPreviewContext";
import { HeroBannerPreviewProvider } from "@/components/dev/HeroBannerPreviewContext";
import { HeroV1PreviewProvider } from "@/components/dev/HeroV1PreviewContext";
import { HeroV21PreviewProvider } from "@/components/dev/HeroV21PreviewContext";
import { HeaderV3PreviewProvider } from "@/components/dev/HeaderV3PreviewContext";
import { PortfolioPreviewProvider } from "@/components/dev/PortfolioPreviewContext";
import { PortfolioV2PreviewProvider } from "@/components/dev/PortfolioV2PreviewContext";
import { FooterV3PreviewProvider } from "@/components/dev/FooterV3PreviewContext";
import { FooterV1PreviewProvider } from "@/components/dev/FooterV1PreviewContext";
import { FooterV4PreviewProvider } from "@/components/dev/FooterV4PreviewContext";
import { resolveFooterV4PreviewSettings } from "@/lib/footer-v4-preview-storage";
import { resolveFooterV1PreviewSettings } from "@/lib/footer-v1-preview-storage";
import { ReviewboxPreviewProvider } from "@/components/dev/ReviewboxPreviewContext";
import { ContactV1PreviewProvider } from "@/components/dev/ContactV1PreviewContext";
import { CtaV1PreviewProvider } from "@/components/dev/CtaV1PreviewContext";
import { ServicesV1LayoutProvider } from "@/components/dev/ServicesV1LayoutContext";
import { ServicesIconsV2PreviewProvider } from "@/components/dev/ServicesIconsV2PreviewContext";
import { ServiceAreaV1PreviewProvider } from "@/components/dev/ServiceAreaV1PreviewContext";
import { ServiceAreaV2PreviewProvider } from "@/components/dev/ServiceAreaV2PreviewContext";
import { HeroV4PreviewProvider } from "@/components/dev/HeroV4PreviewContext";
import { ReviewsPreviewProvider } from "@/components/dev/ReviewsPreviewContext";
import { SpacerStripePreviewProvider } from "@/components/dev/SpacerStripePreviewContext";
import { TextIconsV3PreviewProvider } from "@/components/dev/TextIconsV3PreviewContext";
import { TextImagePreviewProvider } from "@/components/dev/TextImagePreviewContext";
import { TextImagesPreviewProvider } from "@/components/dev/TextImagesPreviewContext";
import { ImagesV1PreviewProvider } from "@/components/dev/ImagesV1PreviewContext";
import { headerVariantUsesPreviewControls } from "@/lib/header-v3-gradient";
import { resolveSectionPreviewField } from "@/lib/home-preview-sync";
import type { HomepagePreviewSettings } from "@/lib/homepage-settings";
import { loadPlaygroundSectionPreviewField } from "@/lib/playground-section-preview-settings";
import { defaultReviewsPreviewSettings } from "@/lib/reviews-preview";
import { resolvePublishedSectionInstanceSettings } from "@/lib/section-instance-copy";
import { normalizeLsdServicesV1Instance } from "@/lib/services-v1-cta";
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
  /** Home stack section ids — site-wide slots read saved global settings on /preview. */
  homeSectionIds?: ReadonlySet<string>;
};

/** Renders a section variant with no playground controls. */
export function SectionPreview({
  group,
  variant,
  sectionId,
  previewSettings,
  homeSectionIds,
}: SectionPreviewProps) {
  const section = sectionGroups[group];
  const variantId = resolveSectionVariantId(group, variant ?? section.defaultVariant);
  const activeVariant = getSectionVariant(group, variantId);
  const content = activeVariant.render();
  const slot = resolvePublishedSectionInstanceSettings(sectionId, previewSettings);

  const savedField = <T,>(
    field: keyof NonNullable<typeof slot>,
    globalKey: keyof HomepagePreviewSettings,
  ): T | undefined =>
    resolveSectionPreviewField<T>({
      sectionId,
      group,
      variant: variantId,
      previewSettings,
      field,
      globalKey,
      homeSectionIds,
    });

  const published = <T,>(slotValue: T | undefined, legacyValue: T | undefined): T | undefined =>
    slotValue ?? legacyValue;

  if (group === "topBar") {
    return (
      <TopBarPreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("topBar", "topBar")}
      >
        {content}
      </TopBarPreviewProvider>
    );
  }

  if (group === "nav") {
    return (
      <NavBarPreviewProvider
        instanceId={sectionId}
        initialSettings={previewSettings?.navBar}
      >
        {content}
      </NavBarPreviewProvider>
    );
  }

  if (group === "services" && variantId === "servicesIcons-v2") {
    return (
      <ServicesIconsV2PreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.servicesIconsV2, previewSettings?.servicesIconsV2)}
      >
        {content}
      </ServicesIconsV2PreviewProvider>
    );
  }

  if (group === "services" && variantId === "service-area-v1") {
    return (
      <ServiceAreaV1PreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.serviceAreaV1, previewSettings?.serviceAreaV1)}
      >
        {content}
      </ServiceAreaV1PreviewProvider>
    );
  }

  if (group === "services" && variantId === "service-area-v2") {
    return (
      <ServiceAreaV2PreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.serviceAreaV2, previewSettings?.serviceAreaV2)}
      >
        {content}
      </ServiceAreaV2PreviewProvider>
    );
  }

  if (group === "reviews" && variantId === "reviews-v1") {
    return (
      <ReviewsPreviewProvider
        instanceId={sectionId}
        initialSettings={
          published(slot?.reviews, previewSettings?.reviews) ?? defaultReviewsPreviewSettings
        }
      >
        {content}
      </ReviewsPreviewProvider>
    );
  }

  if (group === "services") {
    const servicesV1Settings =
      slot?.servicesV1 ??
      (previewSettings?.servicesV1LayoutWidth
        ? { layoutWidth: previewSettings.servicesV1LayoutWidth }
        : undefined);

    return (
      <ServicesV1LayoutProvider
        instanceId={sectionId}
        initialSettings={
          servicesV1Settings
            ? normalizeLsdServicesV1Instance(servicesV1Settings) ?? servicesV1Settings
            : undefined
        }
      >
        {content}
      </ServicesV1LayoutProvider>
    );
  }

  if (group === "spacer") {
    const spacerSettings =
      slot?.spacer ??
      (sectionId ? previewSettings?.spacers?.[sectionId] : undefined) ??
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
      <HeaderV3PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("headerV3", "headerV3")}
      >
        {content}
      </HeaderV3PreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-banner") {
    return (
      <HeroBannerPreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("heroBanner", "heroBanner")}
      >
        {content}
      </HeroBannerPreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-v1") {
    return (
      <HeroV1PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("heroV1", "heroV1")}
      >
        {content}
      </HeroV1PreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-v2.1") {
    return (
      <HeroV21PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("heroV21", "heroV21")}
      >
        {content}
      </HeroV21PreviewProvider>
    );
  }

  if (group === "hero" && variantId === "hero-v4") {
    return (
      <HeroV4PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("heroV4", "heroV4")}
      >
        {content}
      </HeroV4PreviewProvider>
    );
  }

  if (group === "portfolio" && variantId === "portfolio-v1") {
    return (
      <PortfolioPreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("portfolio", "portfolio")}
      >
        {content}
      </PortfolioPreviewProvider>
    );
  }

  if (group === "portfolio" && variantId === "portfolio-v2") {
    return (
      <PortfolioV2PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("portfolioV2", "portfolioV2")}
      >
        {content}
      </PortfolioV2PreviewProvider>
    );
  }

  if (group === "footer" && variantId === "footer-v3") {
    return (
      <FooterV3PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("footerV3", "footerV3")}
      >
        {content}
      </FooterV3PreviewProvider>
    );
  }

  if (group === "footer" && variantId === "footer-v1") {
    return (
      <FooterV1PreviewProvider
        instanceId={sectionId}
        initialSettings={resolveFooterV1PreviewSettings(
          slot?.footerV1,
          previewSettings?.footerV1,
        )}
      >
        {content}
      </FooterV1PreviewProvider>
    );
  }

  if (group === "footer" && variantId === "footer-v4") {
    return (
      <FooterV4PreviewProvider
        instanceId={sectionId}
        initialSettings={resolveFooterV4PreviewSettings(
          slot?.footerV4,
          previewSettings?.footerV4,
        )}
      >
        {content}
      </FooterV4PreviewProvider>
    );
  }

  if (group === "reviewbox" && variantId === "reviewbox-v1") {
    return (
      <ReviewboxPreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("reviewbox", "reviewbox")}
      >
        {content}
      </ReviewboxPreviewProvider>
    );
  }

  if (group === "contact" && variantId === "contact-v1") {
    return (
      <ContactV1PreviewProvider
        instanceId={sectionId}
        initialSettings={loadPlaygroundSectionPreviewField(
          sectionId,
          previewSettings,
          "contact",
          published(slot?.contact, previewSettings?.contact),
        )}
      >
        {content}
      </ContactV1PreviewProvider>
    );
  }

  if (group === "cta" && variantId === "cta-v1") {
    return (
      <CtaV1PreviewProvider
        instanceId={sectionId}
        initialSettings={savedField("ctaV1", "ctaV1")}
      >
        {content}
      </CtaV1PreviewProvider>
    );
  }

  if (group === "content" && variantId === "text-icons-v3") {
    return (
      <TextIconsV3PreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.textIconsV3, previewSettings?.textIconsV3)}
      >
        {content}
      </TextIconsV3PreviewProvider>
    );
  }

  if (group === "content" && variantId === "text-image-v1") {
    return (
      <TextImagePreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.textImage, previewSettings?.textImage)}
      >
        {content}
      </TextImagePreviewProvider>
    );
  }

  if (group === "content" && variantId === "text-images-v1") {
    return (
      <TextImagesPreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.textImages, previewSettings?.textImages)}
      >
        {content}
      </TextImagesPreviewProvider>
    );
  }

  if (group === "content" && variantId === "images-v1") {
    return (
      <ImagesV1PreviewProvider
        instanceId={sectionId}
        initialSettings={published(slot?.imagesV1, previewSettings?.imagesV1)}
      >
        {content}
      </ImagesV1PreviewProvider>
    );
  }

  return content;
}
