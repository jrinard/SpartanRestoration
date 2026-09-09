"use client";

import { useCallback, useMemo } from "react";
import { ServiceAreaV2 } from "@/components/sections/ServiceArea-v2";
import { useServiceAreaV2Preview } from "@/components/dev/ServiceAreaV2PreviewContext";
import type { ServiceAreaV2Card } from "@/lib/service-area-v2-content";
import {
  normalizeServiceAreaV2Card,
  resolveServiceAreaV2Cards,
} from "@/lib/service-area-v2-content";
import { normalizeServiceAreaV2PreviewSettings } from "@/lib/service-area-v2-preview-storage";

type ServiceAreaV2WithPreviewProps = {
  cards: ServiceAreaV2Card[];
};

export function ServiceAreaV2WithPreview({ cards: fallbackCards }: ServiceAreaV2WithPreviewProps) {
  const preview = useServiceAreaV2Preview();

  const resolvedCards = useMemo(
    () => resolveServiceAreaV2Cards(fallbackCards, preview?.settings.cards),
    [fallbackCards, preview?.settings.cards],
  );

  const onUpdateCard = useCallback(
    (cardId: string, nextCard: ServiceAreaV2Card) => {
      if (!preview?.contentEditingEnabled) return;
      const current = resolveServiceAreaV2Cards(fallbackCards, preview.settings.cards);
      const cards = current.map((card) =>
        card.id === cardId
          ? normalizeServiceAreaV2Card({ ...nextCard, id: card.id, slug: card.slug })
          : card,
      );
      preview.setSettings(
        normalizeServiceAreaV2PreviewSettings({ ...preview.settings, cards }),
      );
    },
    [preview, fallbackCards],
  );

  return (
    <ServiceAreaV2
      cards={resolvedCards}
      settings={preview?.settings}
      onUpdateCard={preview?.contentEditingEnabled ? onUpdateCard : undefined}
    />
  );
}
