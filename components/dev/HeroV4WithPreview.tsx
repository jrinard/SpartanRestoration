"use client";

import { HeroV4 } from "@/components/sections/Hero-v4";
import { useHeroV4Preview } from "@/components/dev/HeroV4PreviewContext";
import { defaultHeroV4Breadcrumbs, defaultHeroV4PreviewSettings } from "@/lib/hero-v4-preview";

export function HeroV4WithPreview() {
  const preview = useHeroV4Preview();
  const settings = preview?.settings ?? defaultHeroV4PreviewSettings;

  return (
    <HeroV4
      breadcrumbs={settings.showBreadcrumbs ? (settings.breadcrumbs ?? defaultHeroV4Breadcrumbs) : []}
      eyebrow={settings.eyebrow}
      headline={settings.headline}
      body={settings.body}
      bullets={settings.showBullets ? settings.bullets : []}
      primaryCtaLabel={settings.primaryCtaLabel}
      primaryCtaHref={settings.primaryCtaHref}
      phoneLabel={settings.phoneLabel}
      phoneHref={settings.phoneHref}
      formTitle={settings.formTitle}
      formSubtext={settings.formSubtext}
      formTrustNotes={settings.formTrustNotes}
      formLeadSource={settings.formLeadSource}
      showForm={settings.showForm}
      showCta={settings.showCta}
      showPhoneCta={settings.showPhoneCta}
      showServicePills={settings.showServicePills}
      servicePills={settings.servicePills}
      showGallery={settings.showGallery}
      gallerySlides={settings.gallerySlides}
      galleryIntervalMs={settings.galleryIntervalMs}
      galleryTransition={settings.galleryTransition}
      galleryHeightPx={settings.galleryHeightPx}
      galleryBackground={settings.galleryBackground}
      galleryRadiusPx={settings.galleryRadiusPx}
    />
  );
}
