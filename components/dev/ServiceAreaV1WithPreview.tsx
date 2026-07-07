"use client";

import { ServiceAreaV1 } from "@/components/sections/ServiceArea-v1";
import { useServiceAreaV1Preview } from "@/components/dev/ServiceAreaV1PreviewContext";
import type { ServiceAreaV1Location } from "@/lib/service-area-preview";

type ServiceAreaV1WithPreviewProps = {
  heading: string;
  locations: ServiceAreaV1Location[];
};

export function ServiceAreaV1WithPreview({ heading, locations }: ServiceAreaV1WithPreviewProps) {
  const preview = useServiceAreaV1Preview();

  return (
    <ServiceAreaV1
      heading={heading}
      locations={locations}
      settings={preview?.settings}
      contentEditingEnabled={preview?.contentEditingEnabled}
      getSectionHeading={preview?.getSectionHeading}
      setSectionHeading={preview?.setSectionHeading}
      getLocationLabel={preview?.getLocationLabel}
      setLocationLabel={preview?.setLocationLabel}
      getGraphImageSrc={preview?.getGraphImageSrc}
      setGraphImage={preview?.setGraphImage}
      clearGraphImage={preview?.clearGraphImage}
    />
  );
}
