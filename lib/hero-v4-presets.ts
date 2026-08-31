import { siteConfig } from "@/config/site";
import {
  defaultHeroV4FormLeadSourceId,
  defaultHeroV4PreviewSettings,
  normalizeHeroV4PreviewSettings,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import { phoneTelHref } from "@/lib/phone";

export type HeroV4PresetId = "lifespring" | "langham";

export const defaultHeroV4PresetId: HeroV4PresetId = "lifespring";

/** Langham Construction starter — copy only. Apply does not change the saved JSON schema. */
const langhamHeroV4PresetSettings: HeroV4PreviewSettings = {
  showForm: true,
  showBreadcrumbs: false,
  showBullets: true,
  showPhoneCta: true,
  eyebrow: "Siding · Windows · Doors",
  headline: "Weather ready. Straight lines. No compromise.",
  body:
    "At Langham Construction, siding isn’t just a service we offer — it’s our craft. We combine industry-leading materials with expert installation to create exteriors that look sharp and perform even better. Whether you’re replacing old siding or building a brand-new home, our team of knowledgeable installers will ensure your project is completed on time and to the highest level of quality.",
  bullets: [
    "Quality workmanship",
    "Professional service",
    "Premium materials",
    "5-year workmanship warranty",
  ],
  primaryCtaLabel: "Request a Quote",
  primaryCtaHref: "/contact",
  phoneLabel: siteConfig.phone,
  phoneHref: phoneTelHref(siteConfig.phone),
  formTitle: "Request a Quote",
  formSubtext: "New home siding, replacements, and warranty claims — Vancouver, WA.",
  formTrustNotes: ["5-year transferable warranty", "Family-run since 2023"],
  formLeadSource: "contact-form",
  showServicePills: true,
  servicePills: [
    {
      label: "Siding",
      href: "#services",
      title: "Siding built for the Northwest — Langham Construction",
      description:
        "James Hardie, LP SmartSide, and wood siding installed for Washington weather. New homes and replacements in Vancouver, WA and Southwest Washington.",
    },
    {
      label: "Windows",
      href: "#services",
      title: "Window installation — Langham Construction",
      description:
        "Window installation for new construction and remodels in Vancouver, WA, Clark County, and Southwest Washington.",
    },
    {
      label: "Doors",
      href: "#services",
      title: "Door installation — Langham Construction",
      description:
        "Entry and exterior door installation for homes and remodels in Vancouver, WA and surrounding cities.",
    },
  ],
  breadcrumbs: [{ label: "Home", href: "/" }],
};

export const heroV4Presets: {
  id: HeroV4PresetId;
  label: string;
  settings: HeroV4PreviewSettings;
}[] = [
  { id: "lifespring", label: "LifeSpring", settings: defaultHeroV4PreviewSettings },
  { id: "langham", label: "Langham", settings: langhamHeroV4PresetSettings },
];

function cloneHeroV4Settings(settings: HeroV4PreviewSettings): HeroV4PreviewSettings {
  return {
    ...settings,
    bullets: [...settings.bullets],
    formTrustNotes: [...settings.formTrustNotes],
    formLeadSource: settings.formLeadSource ?? defaultHeroV4FormLeadSourceId,
    servicePills: settings.servicePills.map((pill) => ({ ...pill })),
    breadcrumbs: settings.breadcrumbs?.map((crumb) => ({ ...crumb })),
    gallerySlides: settings.gallerySlides?.map((slide) => ({ ...slide })),
    galleryBackground: settings.galleryBackground,
    galleryRadiusPx: settings.galleryRadiusPx,
  };
}

/** Replace this instance's copy with a named starter. Does not persist a preset id. */
export function applyHeroV4Preset(id: HeroV4PresetId): HeroV4PreviewSettings {
  const preset =
    heroV4Presets.find((item) => item.id === id) ?? heroV4Presets[0];

  return normalizeHeroV4PreviewSettings({
    ...cloneHeroV4Settings(preset.settings),
    phoneLabel: siteConfig.phone,
    phoneHref: phoneTelHref(siteConfig.phone),
  });
}
