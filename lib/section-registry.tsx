import type { ReactNode } from "react";
import { HeaderV1 } from "@/components/layout/Header-v1";
import { HeaderV2 } from "@/components/layout/Header-v2";
import { HeaderV3 } from "@/components/layout/Header-v3";
import { HeroV1 } from "@/components/sections/Hero-v1";
import { HeroV2 } from "@/components/sections/Hero-v2";
import { HeroV3 } from "@/components/sections/Hero-v3";
import { HeroWashingV1 } from "@/components/sections/HeroWashing-v1";
import { HeroWashingV2 } from "@/components/sections/HeroWashing-v2";
import { HeroVideoV1 } from "@/components/sections/HeroVideo-v1";
import { FlipCards } from "@/components/sections/FlipCards";
import { PortfolioV1 } from "@/components/sections/Portfolio-v1";
import { FeatureTilesV1 } from "@/components/sections/FeatureTiles-v1";
import { TestimonialsV1 } from "@/components/sections/Testimonials-v1";
import { TestimonialsV2 } from "@/components/sections/Testimonials-v2";
import { NarrativeV1 } from "@/components/sections/Narrative-v1";
import { TestimonialsV3 } from "@/components/sections/Testimonials-v3";
import { LogoBarV1 } from "@/components/sections/LogoBar-v1";
import { LogoBarV2 } from "@/components/sections/LogoBar-v2";
import { ServicesV3 } from "@/components/sections/Services-v3";
import { ServicesV1 } from "@/components/sections/Services-v1";
import { ServicesV2 } from "@/components/sections/Services-v2";
import { ServicesIconsV1 } from "@/components/sections/ServicesIcons-v1";
import { CTAV1 } from "@/components/sections/CTA-v1";
import { CTAV2 } from "@/components/sections/CTA-v2";
import { FooterV1 } from "@/components/sections/Footer-v1";
import { FooterV2 } from "@/components/layout/Footer-v2";
import { FooterV3 } from "@/components/layout/Footer-v3";
import { FooterV4 } from "@/components/layout/Footer-v4";
import { siteConfig } from "@/config/site";
import {
  detailedServices,
  featureTiles,
  heroDemo,
  iconServices,
  narrativeContent,
  partnerLogos,
  projects,
  simpleServices,
  testimonials,
  ctaContent,
  logoBarHeading,
  servicesIconsHeading,
  servicesIconsSubheading,
  washingHero,
  washingFlipCards,
  fourFlipCards,
  washingServiceSections,
  washingTestimonials,
  associationLogos,
  associationHeading,
  associationNetwork,
  washingFooter,
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
  hero: {
    label: "Hero",
    defaultVariant: "hero-v3",
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
      "hero-v3": {
        label: "Hero-v3",
        render: () => (
          <HeroV3
            lines={heroDemo.lines}
            subtext={heroDemo.subtext}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
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
  flipCards: {
    label: "Flip Cards",
    defaultVariant: "flipCards-v1",
    variants: {
      "flipCards-v1": {
        label: "FlipCards-v1 (3)",
        render: () => <FlipCards cards={washingFlipCards} layout="three" />,
      },
      "flipCards-v2": {
        label: "FlipCards-v2 (4)",
        render: () => <FlipCards cards={fourFlipCards} layout="four" />,
      },
    },
  },
  portfolio: {
    label: "Portfolio",
    defaultVariant: "portfolio-v1",
    variants: {
      "portfolio-v1": {
        label: "Portfolio-v1",
        render: () => <PortfolioV1 projects={projects} ctaHref="/projects" />,
      },
    },
  },
  featureTiles: {
    label: "Feature Tiles",
    defaultVariant: "featureTiles-v1",
    variants: {
      "featureTiles-v1": {
        label: "FeatureTiles-v1",
        render: () => <FeatureTilesV1 tiles={featureTiles} />,
      },
    },
  },
  testimonials: {
    label: "Testimonials",
    defaultVariant: "testimonials-v2",
    variants: {
      "testimonials-v1": {
        label: "Testimonials-v1",
        render: () => <TestimonialsV1 testimonials={testimonials} />,
      },
      "testimonials-v2": {
        label: "Testimonials-v2",
        render: () => <TestimonialsV2 testimonials={testimonials} />,
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
        render: () => <LogoBarV1 heading={logoBarHeading} logos={partnerLogos} />,
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
    defaultVariant: "services-v2",
    variants: {
      "services-v1": {
        label: "Services-v1",
        render: () => (
          <ServicesV1
            heading="What We Do"
            subheading="Placeholder content — customize per client."
            services={simpleServices}
          />
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
            subheading={servicesIconsSubheading}
            services={iconServices}
            ctaLabel={heroDemo.ctaLabel}
            ctaHref={heroDemo.ctaHref}
          />
        ),
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
            headline={ctaContent.headline}
            subtext={ctaContent.subtext}
            ctaLabel={ctaContent.ctaLabel}
            ctaHref={ctaContent.ctaHref}
          />
        ),
      },
      "cta-v2": {
        label: "CTA-v2",
        render: () => (
          <CTAV2
            headline={ctaContent.headline}
            subtext={ctaContent.subtext}
            ctaLabel={ctaContent.ctaLabel}
            ctaHref={ctaContent.ctaHref}
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
        render: () => <FooterV1 description={siteConfig.description} />,
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

export function getSectionVariant(group: SectionGroupId, variantId: string): SectionVariant {
  const section = sectionGroups[group];
  const variants = section.variants as Record<string, SectionVariant>;
  return variants[variantId] ?? variants[section.defaultVariant];
}
