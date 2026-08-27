"use client";

import { ServiceAreaV2 } from "@/components/sections/ServiceArea-v2";
import { useServiceAreaV2Preview } from "@/components/dev/ServiceAreaV2PreviewContext";
import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";

type ServiceAreaV2WithPreviewProps = {
  cards: ServiceAreaV2Card[];
};

export function ServiceAreaV2WithPreview({ cards }: ServiceAreaV2WithPreviewProps) {
  const preview = useServiceAreaV2Preview();

  return <ServiceAreaV2 cards={cards} settings={preview?.settings} />;
}
