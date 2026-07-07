"use client";

import { ServicesV1, type ServiceV1, type ServicesV1Cta } from "@/components/sections/Services-v1";
import { useServicesV1Layout } from "@/components/dev/ServicesV1LayoutContext";
import { defaultServicesV1LayoutWidth } from "@/lib/services-v1-preview";

type ServicesV1WithLayoutProps = {
  heading?: string;
  subheading?: string;
  services: ServiceV1[];
  cta?: ServicesV1Cta;
};

export function ServicesV1WithLayout(props: ServicesV1WithLayoutProps) {
  const context = useServicesV1Layout();

  return (
    <ServicesV1
      {...props}
      layoutWidth={context?.layoutWidth ?? defaultServicesV1LayoutWidth}
      background={context?.background}
    />
  );
}
