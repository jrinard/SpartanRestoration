import {
  buttonBorderRadiusOptions,
  normalizeButtonBorderRadiusPx,
} from "@/lib/button-preview";
import {
  getPreviewGradientBackground,
  previewGradientDirections,
  type PreviewGradientDirection,
} from "@/lib/preview-gradient";
import type { SiteLayoutWidth } from "@/lib/site-layout";
import type { SiteIconName } from "@/lib/site-icons";

export type ServicesIconsV2IconShape = "circle" | "card" | "sharp";

export type ServicesIconsV2ServiceItem = {
  id: string;
  title: string;
  icon?: SiteIconName;
  /** Used for JSON-LD and screen-reader context — not shown on the card face. */
  description?: string;
};

export type ServicesIconsV2PreviewSettings = {
  backgroundFrom: string;
  backgroundTo: string;
  backgroundDirection: PreviewGradientDirection;
  layoutWidth: SiteLayoutWidth;
  outerBackgroundColor: string;
  cardBackgroundColor: string;
  /** Icon frame fill — circle, rounded card, or sharp square. */
  circleColor: string;
  iconShape: ServicesIconsV2IconShape;
  iconColor: string;
  cardTextColor: string;
  headingColor: string;
  ctaBackgroundColor: string;
  ctaTextColor: string;
  cardFontSizePx: number;
  headingFontSizePx: number;
  cardBorderRadiusPx: number;
  cardPaddingPx: number;
  cardMinHeightPx: number;
  iconSizePx: number;
  /** Playground overrides keyed by service id. */
  serviceIcons: Partial<Record<string, SiteIconName>>;
  /** Playground label overrides keyed by service id. */
  serviceLabels: Partial<Record<string, string>>;
  /** Playground description overrides — sr-only + JSON-LD, keyed by service id. */
  serviceDescriptions: Partial<Record<string, string>>;
  /** Playground CTA phone label override (display text). */
  ctaLabel?: string;
  /** Playground CTA tel href override. */
  ctaHref?: string;
  /** Playground section heading override (h2). */
  sectionHeading?: string;
  /**
   * Optional card list. Missing keeps the section's built-in construction cards.
   * Explicit `[]` is a saved empty grid.
   */
  services?: ServicesIconsV2ServiceItem[];
  /** Optional sr-only / JSON-LD sentence. Missing keeps the section default. */
  seoDescription?: string;
};

export const defaultServicesIconsV2OuterBackgroundColor = "#ffffff";

export const defaultServicesIconsV2PreviewSettings: ServicesIconsV2PreviewSettings = {
  backgroundFrom: "#ffffff",
  backgroundTo: "#ffffff",
  backgroundDirection: "none",
  layoutWidth: "contained",
  outerBackgroundColor: defaultServicesIconsV2OuterBackgroundColor,
  cardBackgroundColor: "#000000",
  circleColor: "#748B9F",
  iconShape: "circle",
  iconColor: "#ffffff",
  cardTextColor: "#ffffff",
  headingColor: "#000000",
  ctaBackgroundColor: "#748B9F",
  ctaTextColor: "#ffffff",
  cardFontSizePx: 24,
  headingFontSizePx: 48,
  cardBorderRadiusPx: 10,
  cardPaddingPx: 30,
  cardMinHeightPx: 140,
  iconSizePx: 75,
  serviceIcons: {},
  serviceLabels: {},
  serviceDescriptions: {},
};

export { previewGradientDirections as servicesIconsV2GradientDirections };
export { buttonBorderRadiusOptions as servicesIconsV2BorderRadiusOptions };

export const servicesIconsV2IconShapeOptions: {
  value: ServicesIconsV2IconShape;
  label: string;
}[] = [
  { value: "circle", label: "Circle" },
  { value: "card", label: "Card" },
  { value: "sharp", label: "Sharp" },
];

export function isServicesIconsV2IconShape(value: unknown): value is ServicesIconsV2IconShape {
  return value === "circle" || value === "card" || value === "sharp";
}

export function getServicesIconsV2IconFrameBorderRadius(
  shape: ServicesIconsV2IconShape,
  iconSizePx: number,
  cardBorderRadiusPx: number,
): string | number {
  switch (shape) {
    case "sharp":
      return 0;
    case "card":
      return Math.min(cardBorderRadiusPx, Math.max(4, Math.round(iconSizePx * 0.2)));
    case "circle":
    default:
      return "50%";
  }
}

export function getServicesIconsV2BackgroundStyle(
  settings: ServicesIconsV2PreviewSettings,
): string {
  return getPreviewGradientBackground(
    settings.backgroundFrom,
    settings.backgroundTo,
    settings.backgroundDirection,
  );
}

export function normalizeServicesIconsV2BorderRadiusPx(value: number): number {
  return normalizeButtonBorderRadiusPx(value);
}

export function clampServicesIconsV2FontSizePx(
  value: number,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function clampServicesIconsV2CardPaddingPx(value: number): number {
  if (!Number.isFinite(value)) return defaultServicesIconsV2PreviewSettings.cardPaddingPx;
  return Math.min(48, Math.max(16, Math.round(value)));
}

export function clampServicesIconsV2CardMinHeightPx(value: number): number {
  if (!Number.isFinite(value)) return defaultServicesIconsV2PreviewSettings.cardMinHeightPx;
  return Math.min(220, Math.max(100, Math.round(value)));
}

export function clampServicesIconsV2IconSizePx(value: number): number {
  if (!Number.isFinite(value)) return defaultServicesIconsV2PreviewSettings.iconSizePx;
  return Math.min(96, Math.max(48, Math.round(value)));
}

/** Apply label and/or description edits in one settings object (Forge card editor). */
export function patchServicesIconsV2ServiceCard(
  settings: ServicesIconsV2PreviewSettings,
  serviceId: string,
  patch: { label?: string; description?: string },
): ServicesIconsV2PreviewSettings {
  let next: ServicesIconsV2PreviewSettings = { ...settings };

  if (patch.label !== undefined) {
    const trimmed = patch.label.trim();
    if (trimmed) {
      next = {
        ...next,
        serviceLabels: {
          ...next.serviceLabels,
          [serviceId]: trimmed,
        },
      };
      if (next.services) {
        next = {
          ...next,
          services: next.services.map((service) =>
            service.id === serviceId ? { ...service, title: trimmed } : service,
          ),
        };
      }
    }
  }

  if (patch.description !== undefined) {
    const trimmed = patch.description.trim();
    const nextDescriptions = { ...next.serviceDescriptions };
    if (trimmed) {
      nextDescriptions[serviceId] = trimmed;
    } else {
      delete nextDescriptions[serviceId];
    }
    next = { ...next, serviceDescriptions: nextDescriptions };

    if (next.services) {
      next = {
        ...next,
        services: next.services.map((service) => {
          if (service.id !== serviceId) return service;
          if (!trimmed) {
            const { description: _removed, ...rest } = service;
            return rest;
          }
          return { ...service, description: trimmed };
        }),
      };
    }
  }

  return next;
}

/** Settings `services` when present; otherwise the section's built-in cards. */
export function resolveServicesIconsV2Services(
  settings: ServicesIconsV2PreviewSettings,
  fallback: readonly ServicesIconsV2ServiceItem[],
): ServicesIconsV2ServiceItem[] {
  const source = settings.services !== undefined ? settings.services : fallback;
  return source.map((service, index) => {
    const id = service.id.trim() || `service-${index + 1}`;
    const description =
      settings.serviceDescriptions[id] ?? service.description;
    return {
      id,
      title: settings.serviceLabels[id] ?? service.title,
      ...(description !== undefined ? { description } : {}),
      icon: settings.serviceIcons[id] ?? service.icon,
    };
  });
}
