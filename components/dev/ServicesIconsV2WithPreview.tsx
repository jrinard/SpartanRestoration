"use client";

import { ServicesIconsV2 } from "@/components/sections/ServicesIcons-v2";
import { useServicesIconsV2Preview } from "@/components/dev/ServicesIconsV2PreviewContext";
import type { ServicesIconsV2Cta, ServicesIconsV2Service } from "@/components/sections/ServicesIcons-v2";

type ServicesIconsV2WithPreviewProps = {
  heading: string;
  seoDescription: string;
  services: ServicesIconsV2Service[];
  cta: ServicesIconsV2Cta;
};

export function ServicesIconsV2WithPreview({
  heading,
  seoDescription,
  services,
  cta,
}: ServicesIconsV2WithPreviewProps) {
  const preview = useServicesIconsV2Preview();

  return (
    <ServicesIconsV2
      heading={heading}
      seoDescription={seoDescription}
      services={services}
      cta={cta}
      settings={preview?.settings}
    />
  );
}
