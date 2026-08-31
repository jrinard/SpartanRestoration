import type { ReactNode } from "react";
import { HeaderV1 } from "@/components/layout/Header-v1";
import { HeaderV2 } from "@/components/layout/Header-v2";
import { HeaderV3 } from "@/components/layout/Header-v3";
import { TopBarV1 } from "@/components/sections/TopBar-v1";
import { NavV1 } from "@/components/sections/Nav-v1";
import { HeroV1 } from "@/components/sections/Hero-v1";
import { HeroV2 } from "@/components/sections/Hero-v2";
import { HeroV21 } from "@/components/sections/Hero-v2.1";
import { HeroV3 } from "@/components/sections/Hero-v3";
import { HeroBanner } from "@/components/sections/Hero-banner";
import { HeroWashingV1 } from "@/components/sections/HeroWashing-v1";
import { HeroWashingV2 } from "@/components/sections/HeroWashing-v2";
import { HeroVideoV1 } from "@/components/sections/HeroVideo-v1";
import { FlipCards } from "@/components/sections/FlipCards";
import { TextIconsV3 } from "@/components/sections/TextIcons-v3";
import { TextImageV1 } from "@/components/sections/TextImage-v1";
import { TextImagesV1 } from "@/components/sections/TextImages-v1";
import { ImagesV1 } from "@/components/sections/Images-v1";
import { PortfolioV1 } from "@/components/sections/Portfolio-v1";
import { PortfolioV2 } from "@/components/sections/Portfolio-v2";
import { FeatureTilesV1 } from "@/components/sections/FeatureTiles-v1";
import { TestimonialsV1 } from "@/components/sections/Testimonials-v1";
import { TestimonialsV2 } from "@/components/sections/Testimonials-v2";
import { NarrativeV1 } from "@/components/sections/Narrative-v1";
import { TestimonialsV3 } from "@/components/sections/Testimonials-v3";
import { LogoBarV1 } from "@/components/sections/LogoBar-v1";
import { LogoBarV2 } from "@/components/sections/LogoBar-v2";
import { SpacerStripeWithPreview } from "@/components/dev/SpacerStripeWithPreview";
import { SpacerLineWithPreview } from "@/components/dev/SpacerLineWithPreview";
import { SpacerFadeWithPreview } from "@/components/dev/SpacerFadeWithPreview";
import { ServicesV1WithLayout } from "@/components/dev/ServicesV1WithLayout";
import { ServicesV2 } from "@/components/sections/Services-v2";
import { ServicesV3 } from "@/components/sections/Services-v3";
import { ServicesIconsV1 } from "@/components/sections/ServicesIcons-v1";
import { ServicesIconsV2WithPreview } from "@/components/dev/ServicesIconsV2WithPreview";
import { ServiceAreaV1WithPreview } from "@/components/dev/ServiceAreaV1WithPreview";
import { ServiceAreaV2WithPreview } from "@/components/dev/ServiceAreaV2WithPreview";
import { HeroV4WithPreview } from "@/components/dev/HeroV4WithPreview";
import { ReviewsV1WithPreview } from "@/components/dev/ReviewsV1WithPreview";
import { CTAV1 } from "@/components/sections/CTA-v1";
import { CTAV2 } from "@/components/sections/CTA-v2";
import { ContactV1 } from "@/components/sections/Contact-v1";
import { ReviewboxV1 } from "@/components/sections/Reviewbox-v1";
import { FooterV1 } from "@/components/sections/Footer-v1";
import { FooterV2 } from "@/components/layout/Footer-v2";
import { FooterV3 } from "@/components/layout/Footer-v3";
import { FooterV4 } from "@/components/layout/Footer-v4";
import { siteConfig } from "@/config/site";
import { serviceAreaV2Cards } from "@/lib/service-area-v2-content";
import {
  detailedServices,
  getBrandingProjects,
  getFeatureTiles,
  getPartnerLogos,
  getProjects,
  getServicesIconsSubheading,
  getServicesIconsV2SeoDescription,
  getSimpleServices,
  getTestimonials,
  heroDemo,
  heroV21Demo,
  iconServices,
  narrativeContent,
  servicesV1Cta,
  ctaContent,
  ctaV2Content,
  contactContent,
  reviewboxContent,
  logoBarHeading,
  servicesIconsHeading,
  servicesIconsV2Heading,
  servicesIconsV2Services,
  servicesIconsV2Cta,
  serviceAreaV1Heading,
  serviceAreaV1Locations,
  washingHero,
  washingFlipCards,
  fourFlipCards,
  washingServiceSections,
  washingTestimonials,
  associationLogos,
  associationHeading,
  associationNetwork,
  washingFooter,
  stonePillarTextIconsContent,
  stonePillarTextImagesContent,
  stonePillarImagesV1Content,
  spartanTextImageContent,
} from "@/lib/demo-content";

export type SectionVariant = {
  label: string;
  render: () => ReactNode;
};

export type SectionGroup = {
  label: string;
  defaultVariant: string;
  variants: Record<string, SectionVariant>;
};

export const sectionGroups = {
  topBar: {
    label: "TopBar",
    defaultVariant: "top-bar-v1",
    variants: {
      "top-bar-v1": {
        label: "TopBar-v1",
        render: () => <TopBarV1 />,
      },
    },
  },
  header: {
    label: "Header",
    defaultVariant: "header-v1",
    variants: {
      "header-v1": {
        label: "Header-v1",
        render: () => <HeaderV1 />,
      },
      "header-v2": {
        label: "Header-v2",
        render: () => <HeaderV2 />,
      },
      "header-v3": {
        label: "Header-v3",
        render: () => <HeaderV3 />,
      },
    },
  },
  nav: {
    label: "Nav",
    defaultVariant: "nav-v1",
    variants: {
      "nav-v1": {
        label: "Nav-v1 (Global)",
        render: () => <NavV1 />,
      },
    },
  },
  hero: {
    label: "Hero",
    defaultVariant: "hero-banner",
    variants: {
      "hero-v1": {
        label: "Hero-v1",
        render: () => (
          <HeroV1
            headline={heroDemo.headline}
            subtext={heroDemo.subtext}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
      },
      "hero-v2": {
        label: "Hero-v2",
        render: () => (
          <HeroV2
            headline={heroDemo.headline}
            subtext={heroDemo.subtext}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
      },
      "hero-v2.1": {
        label: "Hero-v2.1",
        render: () => (
          <HeroV21
            headlineLines={heroV21Demo.headlineLines}
            subtextLines={heroV21Demo.subtextLines}
            highlights={heroV21Demo.highlights}
            ctaLabel={heroV21Demo.ctaLabel}
            ctaHref={heroV21Demo.ctaHref}
          />
        ),
      },
      "hero-v3": {
        label: "Hero-v3 (Stacked headline)",
        render: () => (
          <HeroV3
            lines={heroDemo.lines ?? [heroDemo.headline]}
            subtext={heroDemo.subtext}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
      },
      "hero-v4": {
        label: "Hero-v4",
        render: () => <HeroV4WithPreview />,
      },
      "hero-banner": {
        label: "Hero-banner (Spartan image banner)",
        render: () => <HeroBanner />,
      },
      "heroVideo-v1": {
        label: "HeroVideo-v1",
        render: () => (
          <HeroVideoV1
            lines={heroDemo.lines}
            subtext={heroDemo.subtext}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
      },
      "heroWashing-v1": {
        label: "HeroWashing-v1",
        render: () => (
          <HeroWashingV1
            headline={washingHero.headline}
            serviceAreas={washingHero.serviceAreas}
            quoteLabel={washingHero.quoteLabel}
            quoteHref={washingHero.quoteHref}
            phoneLabel={washingHero.phoneLabel}
            phoneHref={washingHero.phoneHref}
            backgroundImage={washingHero.backgroundImage}
          />
        ),
      },
      "heroWashing-v2": {
        label: "HeroWashing-v2",
        render: () => (
          <HeroWashingV2
            headline={washingHero.headline}
            leadText={washingHero.leadText}
            quoteLabel={washingHero.quoteLabel}
            quoteHref={washingHero.quoteHref}
            phoneLabel={washingHero.phoneLabel}
            phoneHref={washingHero.phoneHref}
            backgroundImage={washingHero.backgroundImage}
          />
        ),
      },
    },
  },
  content: {
    label: "Content",
    defaultVariant: "text-icons-v3",
    variants: {
      "flipCards-v1": {
        label: "Flip Cards v1",
        render: () => <FlipCards cards={washingFlipCards} layout="three" />,
      },
      "flipCards-v2": {
        label: "Flip Cards v2",
        render: () => <FlipCards cards={fourFlipCards} layout="four" />,
      },
      "text-icons-v3": {
        label: "Text-icons v3",
        render: () => (
          <TextIconsV3
            heading={stonePillarTextIconsContent.heading}
            subheading={stonePillarTextIconsContent.subheading}
            items={stonePillarTextIconsContent.items}
          />
        ),
      },
      "text-image-v1": {
        label: "Text and Image",
        render: () => (
          <TextImageV1
            eyebrow={spartanTextImageContent.eyebrow}
            headlineLines={spartanTextImageContent.headlineLines}
            body={spartanTextImageContent.body}
            phoneLabel={spartanTextImageContent.phoneLabel}
            phoneHref={spartanTextImageContent.phoneHref}
            imageSrc={spartanTextImageContent.imageSrc}
            imageAlt={spartanTextImageContent.imageAlt}
            sidebarText={spartanTextImageContent.sidebarText}
          />
        ),
      },
      "text-images-v1": {
        label: "Text and Images",
        render: () => (
          <TextImagesV1
            row1={stonePillarTextImagesContent.row1}
            row2={stonePillarTextImagesContent.row2}
            row3={stonePillarTextImagesContent.row3}
          />
        ),
      },
      "images-v1": {
        label: "Image(s)",
        render: () => (
          <ImagesV1
            heading={stonePillarImagesV1Content.heading}
            seoDescription={stonePillarImagesV1Content.seoDescription}
            cards={stonePillarImagesV1Content.cards}
          />
        ),
      },
    },
  },
  spacer: {
    label: "Spacer",
    defaultVariant: "spacer-v1",
    variants: {
      "spacer-v1": {
        label: "Spacer-v1 (Stripe)",
        render: () => <SpacerStripeWithPreview />,
      },
      "spacer-v2": {
        label: "Spacer-v2 (Gradient)",
        render: () => <SpacerStripeWithPreview />,
      },
      "spacer-v3": {
        label: "Spacer-v3 (Line)",
        render: () => <SpacerLineWithPreview />,
      },
      "spacer-v4": {
        label: "Spacer-v4 (Fade)",
        render: () => <SpacerFadeWithPreview />,
      },
    },
  },
  portfolio: {
    label: "Portfolio",
    defaultVariant: "portfolio-v1",
    variants: {
      "portfolio-v1": {
        label: "Portfolio-v1",
        render: () => (
          <PortfolioV1 heading="Projects" projects={getProjects()} brandingProjects={getBrandingProjects()} />
        ),
      },
      "portfolio-v2": {
        label: "Portfolio-v2 (Slices)",
        render: () => <PortfolioV2 />,
      },
    },
  },
  reviews: {
    label: "Reviews",
    defaultVariant: "reviews-v1",
    variants: {
      "reviews-v1": {
        label: "Reviews-v1",
        render: () => <ReviewsV1WithPreview />,
      },
    },
  },
  featureTiles: {
    label: "Feature Tiles",
    defaultVariant: "featureTiles-v1",
    variants: {
      "featureTiles-v1": {
        label: "FeatureTiles-v1",
        render: () => <FeatureTilesV1 tiles={getFeatureTiles()} />,
      },
    },
  },
  testimonials: {
    label: "Testimonials",
    defaultVariant: "testimonials-v2",
    variants: {
      "testimonials-v1": {
        label: "Testimonials-v1",
        render: () => <TestimonialsV1 testimonials={getTestimonials()} />,
      },
      "testimonials-v2": {
        label: "Testimonials-v2",
        render: () => <TestimonialsV2 testimonials={getTestimonials()} />,
      },
      "testimonials-v3": {
        label: "Testimonials-v3",
        render: () => (
          <TestimonialsV3
            testimonials={washingTestimonials}
            associationHeading={associationHeading}
            associationLogos={associationLogos}
            networkLabel={associationNetwork.label}
            networkHref={associationNetwork.href}
          />
        ),
      },
    },
  },
  narrative: {
    label: "Narrative",
    defaultVariant: "narrative-v1",
    variants: {
      "narrative-v1": {
        label: "Narrative-v1",
        render: () => (
          <NarrativeV1
            heading={narrativeContent.heading}
            body={narrativeContent.body}
            ctaLabel={narrativeContent.ctaLabel}
            ctaHref={narrativeContent.ctaHref}
          />
        ),
      },
    },
  },
  logoBar: {
    label: "Logo Bar",
    defaultVariant: "logoBar-v1",
    variants: {
      "logoBar-v1": {
        label: "LogoBar-v1",
        render: () => <LogoBarV1 heading={logoBarHeading} logos={getPartnerLogos()} />,
      },
      "logoBar-v2": {
        label: "LogoBar-v2",
        render: () => (
          <LogoBarV2
            heading={associationHeading}
            logos={associationLogos}
            networkLabel={associationNetwork.label}
            networkHref={associationNetwork.href}
          />
        ),
      },
    },
  },
  services: {
    label: "Services",
    defaultVariant: "services-v1",
    variants: {
      "services-v1": {
        label: "Services-v1",
        render: () => (
          <ServicesV1WithLayout heading="Services" services={getSimpleServices()} cta={servicesV1Cta} />
        ),
      },
      "services-v2": {
        label: "Services-v2",
        render: () => (
          <ServicesV2
            heading="Our Services"
            subheading={`${siteConfig.name} helps businesses grow with design, development, and strategy.`}
            services={detailedServices}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
      },
      "servicesIcons-v1": {
        label: "ServicesIcons-v1",
        render: () => (
          <ServicesIconsV1
            heading={servicesIconsHeading}
            subheading={getServicesIconsSubheading()}
            services={iconServices}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
      },
      "servicesIcons-v2": {
        label: "ServicesIcons-v2",
        render: () => (
          <ServicesIconsV2WithPreview
            heading={servicesIconsV2Heading}
            seoDescription={getServicesIconsV2SeoDescription()}
            services={[...servicesIconsV2Services]}
            cta={servicesIconsV2Cta}
          />
        ),
      },
      "service-area-v1": {
        label: "Service-Area",
        render: () => (
          <ServiceAreaV1WithPreview
            heading={serviceAreaV1Heading}
            locations={[...serviceAreaV1Locations]}
          />
        ),
      },
      "service-area-v2": {
        label: "Service-Area-v2",
        render: () => <ServiceAreaV2WithPreview cards={[...serviceAreaV2Cards]} />,
      },
      "services-v3": {
        label: "Services-v3",
        render: () => <ServicesV3 sections={washingServiceSections} />,
      },
    },
  },
  cta: {
    label: "CTA",
    defaultVariant: "cta-v1",
    variants: {
      "cta-v1": {
        label: "CTA-v1",
        render: () => (
          <CTAV1
            headlineLines={ctaContent.headlineLines}
            phoneLabel={ctaContent.phoneLabel}
            phoneHref={ctaContent.phoneHref}
          />
        ),
      },
      "cta-v2": {
        label: "CTA-v2",
        render: () => (
          <CTAV2
            headline={ctaV2Content.headline}
            subtext={ctaV2Content.subtext}
            ctaLabel={ctaV2Content.ctaLabel}
            ctaHref={ctaV2Content.ctaHref}
          />
        ),
      },
    },
  },
  reviewbox: {
    label: "Reviewbox",
    defaultVariant: "reviewbox-v1",
    variants: {
      "reviewbox-v1": {
        label: "Reviewbox-v1",
        render: () => (
          <ReviewboxV1
            logoSrc={reviewboxContent.logoSrc}
            logoAlt={reviewboxContent.logoAlt}
            headlineLines={reviewboxContent.headlineLines}
            subtext={reviewboxContent.subtext}
            productLink={reviewboxContent.productLink}
            bullets={reviewboxContent.bullets}
            features={reviewboxContent.features}
            featuresLabel={reviewboxContent.featuresLabel}
            ctaLabel={reviewboxContent.ctaLabel}
            ctaSubtext={reviewboxContent.ctaSubtext}
            ctaHref={reviewboxContent.ctaHref}
            desktop={reviewboxContent.desktop}
            leftExample={reviewboxContent.leftExample}
            rightMessage={reviewboxContent.rightMessage}
          />
        ),
      },
    },
  },
  contact: {
    label: "Contact",
    defaultVariant: "contact-v1",
    variants: {
      "contact-v1": {
        label: "Contact-v1 (Modal)",
        render: () => (
          <ContactV1
            title={contactContent.title}
            subtext={contactContent.subtext}
            phonePrefix={contactContent.phonePrefix}
            phone={siteConfig.phone}
            formDivider={contactContent.formDivider}
            formIntro={contactContent.formIntro}
          />
        ),
      },
    },
  },
  footer: {
    label: "Footer",
    defaultVariant: "footer-v1",
    variants: {
      "footer-v1": {
        label: "Footer-v1",
        render: () => <FooterV1 description={siteConfig.tagline} />,
      },
      "footer-v2": {
        label: "Footer-v2",
        render: () => <FooterV2 description={siteConfig.description} />,
      },
      "footer-v3": {
        label: "Footer-v3",
        render: () => <FooterV3 description={siteConfig.description} />,
      },
      "footer-v4": {
        label: "Footer-v4",
        render: () => (
          <FooterV4
            hours={washingFooter.hours}
            serviceLinks={washingFooter.serviceLinks}
            licenses={washingFooter.licenses}
          />
        ),
      },
    },
  },
} satisfies Record<string, SectionGroup>;

export type SectionGroupId = keyof typeof sectionGroups;

/**
 * Resolve a saved variant id to a registry key.
 * Hero-v3 and hero-banner are separate variants — no alias (pick explicitly in playground).
 * Legacy Spartan JSON that used id `hero-v3` for the banner should be re-saved as `hero-banner`.
 */
export function resolveSectionVariantId(group: SectionGroupId, variantId: string): string {
  return variantId;
}

export function getSectionVariant(group: SectionGroupId, variantId: string): SectionVariant {
  const section = sectionGroups[group];
  const variants = section.variants as Record<string, SectionVariant>;
  const resolvedId = resolveSectionVariantId(group, variantId);
  return variants[resolvedId] ?? variants[section.defaultVariant];
}
