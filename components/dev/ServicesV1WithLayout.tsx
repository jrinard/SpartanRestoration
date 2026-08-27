"use client";

import { ServicesV1, type ServiceV1, type ServicesV1Cta } from "@/components/sections/Services-v1";
import { useServicesV1Layout } from "@/components/dev/ServicesV1LayoutContext";
import { isLsdOrg, lsdServicesV1Cta, servicesV1Cta } from "@/lib/demo-content";
import { resolveLsdServicesV1Cta } from "@/lib/services-v1-cta";
import { defaultServicesV1LayoutWidth } from "@/lib/services-v1-preview";

type ServicesV1WithLayoutProps = {
  heading?: string;
  subheading?: string;
  services: ServiceV1[];
  cta?: ServicesV1Cta;
};

export function ServicesV1WithLayout(props: ServicesV1WithLayoutProps) {
  const context = useServicesV1Layout();
  const fallbackCta = isLsdOrg() ? lsdServicesV1Cta : servicesV1Cta;
  const rawCta = context?.cta ?? props.cta ?? fallbackCta;
  const cta = isLsdOrg() ? resolveLsdServicesV1Cta(rawCta) : rawCta;

  return (
    <ServicesV1
      heading={context?.heading ?? props.heading}
      subheading={props.subheading}
      services={
        context?.services && context.services.length > 0 ? context.services : props.services
      }
      cta={cta}
      layoutWidth={context?.layoutWidth ?? defaultServicesV1LayoutWidth}
      background={context?.background}
    />
  );
}
