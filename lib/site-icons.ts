import {
  AirVent,
  Biohazard,
  Brush,
  Building2,
  ClipboardCheck,
  CloudRain,
  Droplets,
  Fan,
  FileText,
  Flame,
  Hammer,
  HardHat,
  Home,
  Package,
  Phone,
  ScanSearch,
  Shield,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Thermometer,
  Waves,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type SiteIconEntry = {
  Icon: LucideIcon;
  label: string;
};

export const siteIconCatalog = {
  droplets: { Icon: Droplets, label: "Water" },
  waves: { Icon: Waves, label: "Flood" },
  wind: { Icon: Wind, label: "Air flow" },
  fan: { Icon: Fan, label: "Fan" },
  "air-vent": { Icon: AirVent, label: "Ventilation" },
  biohazard: { Icon: Biohazard, label: "Biohazard" },
  sparkles: { Icon: Sparkles, label: "Clean" },
  brush: { Icon: Brush, label: "Brush" },
  "spray-can": { Icon: SprayCan, label: "Spray" },
  "scan-search": { Icon: ScanSearch, label: "Inspect" },
  thermometer: { Icon: Thermometer, label: "Moisture" },
  "cloud-rain": { Icon: CloudRain, label: "Storm" },
  flame: { Icon: Flame, label: "Fire" },
  shield: { Icon: Shield, label: "Shield" },
  "shield-check": { Icon: ShieldCheck, label: "Protection" },
  package: { Icon: Package, label: "Contents" },
  hammer: { Icon: Hammer, label: "Demolition" },
  wrench: { Icon: Wrench, label: "Repair" },
  "hard-hat": { Icon: HardHat, label: "Construction" },
  home: { Icon: Home, label: "Home" },
  "building-2": { Icon: Building2, label: "Commercial" },
  "file-text": { Icon: FileText, label: "Document" },
  "clipboard-check": { Icon: ClipboardCheck, label: "Claims" },
  phone: { Icon: Phone, label: "Phone" },
} as const satisfies Record<string, SiteIconEntry>;

export type SiteIconName = keyof typeof siteIconCatalog;

export const siteIconNames = Object.keys(siteIconCatalog) as SiteIconName[];

export const defaultSiteIconName: SiteIconName = "droplets";

export function isSiteIconName(value: unknown): value is SiteIconName {
  return typeof value === "string" && value in siteIconCatalog;
}

export function resolveSiteIconName(
  value: unknown,
  fallback: SiteIconName = defaultSiteIconName,
): SiteIconName {
  return isSiteIconName(value) ? value : fallback;
}

export function normalizeServiceIconsMap(
  value: unknown,
): Partial<Record<string, SiteIconName>> {
  if (!value || typeof value !== "object") return {};

  const normalized: Partial<Record<string, SiteIconName>> = {};
  for (const [serviceId, iconName] of Object.entries(value)) {
    if (typeof serviceId === "string" && isSiteIconName(iconName)) {
      normalized[serviceId] = iconName;
    }
  }
  return normalized;
}

export function normalizeServiceLabelsMap(value: unknown): Partial<Record<string, string>> {
  if (!value || typeof value !== "object") return {};

  const normalized: Partial<Record<string, string>> = {};
  for (const [serviceId, label] of Object.entries(value)) {
    if (typeof serviceId === "string" && typeof label === "string") {
      const trimmed = label.trim();
      if (trimmed) normalized[serviceId] = trimmed;
    }
  }
  return normalized;
}
