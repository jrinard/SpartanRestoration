import { siteConfig } from "@/config/site";
import { SERVICE_AREAS_PATH } from "@/lib/service-area-pages";
import { phoneTelHref } from "@/lib/phone";

export type HeroV4Breadcrumb = {
  label: string;
  href?: string;
};

export type HeroV4ServicePill = {
  label: string;
  href: string;
  /** Accessible link title + SEO context for the service. */
  title: string;
  /** Schema.org Service description. */
  description: string;
};

export type HeroV4FormLeadSourceId = "website-review" | "contact-form";

/** Foundation CRM `sms_opt_in_source` presets for Hero-v4 inline forms. */
export const heroV4FormLeadSourceOptions: {
  id: HeroV4FormLeadSourceId;
  label: string;
  path: string;
}[] = [
  { id: "website-review", label: "Website review", path: "/website-review" },
  { id: "contact-form", label: "Contact form", path: "/contact-form" },
];

export const defaultHeroV4FormLeadSourceId: HeroV4FormLeadSourceId = "website-review";

export function normalizeHeroV4FormLeadSourceId(value: unknown): HeroV4FormLeadSourceId {
  if (value === "contact-form" || value === "website-review") return value;
  return defaultHeroV4FormLeadSourceId;
}

export function resolveHeroV4FormLeadSource(
  sourceId: HeroV4FormLeadSourceId = defaultHeroV4FormLeadSourceId,
): string {
  const option = heroV4FormLeadSourceOptions.find((item) => item.id === sourceId);
  const path = option?.path ?? "/website-review";
  return `${siteConfig.url}${path}`;
}

export type HeroV4PreviewSettings = {
  showForm: boolean;
  showBreadcrumbs: boolean;
  showBullets: boolean;
  showPhoneCta: boolean;
  eyebrow: string;
  headline: string;
  body: string;
  bullets: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  phoneLabel: string;
  phoneHref: string;
  formTitle: string;
  formSubtext: string;
  formTrustNotes: string[];
  /** Foundation CRM source for the inline form. */
  formLeadSource?: HeroV4FormLeadSourceId;
  showServicePills: boolean;
  servicePills: HeroV4ServicePill[];
  breadcrumbs?: HeroV4Breadcrumb[];
};

export const defaultHeroV4Breadcrumbs: HeroV4Breadcrumb[] = [
  { label: "Home", href: "/" },
  { label: "Service Areas", href: SERVICE_AREAS_PATH },
  { label: "Clark County, WA" },
];

export const defaultHeroV4ServicePills: HeroV4ServicePill[] = [
  {
    label: "Custom Web Design",
    href: "#services",
    title: "Custom web design in Clark County, WA — LifeSpring Design",
    description:
      "Custom website design and development for Vancouver, Camas, Battle Ground, and businesses across Clark County, Washington.",
  },
  {
    label: "Custom Software",
    href: "#services",
    title: "Custom software development for Clark County, WA businesses",
    description:
      "Custom business software, internal tools, dashboards, and workflow applications built for Clark County and Pacific Northwest teams.",
  },
  {
    label: "CRM",
    href: "#services",
    title: "Custom CRM development for Clark County, WA businesses",
    description:
      "Custom CRM systems, customer management tools, and sales workflow software for Clark County and Pacific Northwest businesses.",
  },
  {
    label: "Logo & Branding",
    href: "#services",
    title: "Logo design and branding for Clark County businesses",
    description:
      "Professional logo design, brand identity, and graphic design for Pacific Northwest and Clark County businesses.",
  },
  {
    label: "Reputation Growth",
    href: "#reviewbox",
    title: "Online reputation management and Google reviews with Reviewbox.io",
    description:
      "Grow Google reviews and online reputation for local Clark County businesses with Reviewbox.io review management.",
  },
  {
    label: "Optimization",
    href: "#services",
    title: "Website optimization and SEO for local search in Clark County, WA",
    description:
      "Website performance optimization, SEO, and ongoing improvements to help Clark County businesses get found online.",
  },
];

export const defaultHeroV4PreviewSettings: HeroV4PreviewSettings = {
  showForm: false,
  showBreadcrumbs: true,
  showBullets: false,
  showPhoneCta: true,
  eyebrow: "Where We Serve",
  headline: "Web design all across Clark County",
  body:
    "From Vancouver and Salmon Creek to Battle Ground, Ridgefield, Camas, and Washougal, LifeSpring Design covers the whole county. Custom websites, software, and branding for local businesses ready to grow online.",
  bullets: [
    "Custom websites",
    "Web design & SEO",
    "Software & branding",
    "Free website review",
  ],
  primaryCtaLabel: "Get a Free Website Review",
  primaryCtaHref: "/contact",
  phoneLabel: siteConfig.phone,
  phoneHref: phoneTelHref(siteConfig.phone),
  formTitle: "Get a Free Website Review",
  formSubtext: "Web design & custom software in Clark County, WA.",
  formTrustNotes: ["No spam, ever", "100% free review"],
  formLeadSource: defaultHeroV4FormLeadSourceId,
  showServicePills: true,
  servicePills: defaultHeroV4ServicePills,
  breadcrumbs: defaultHeroV4Breadcrumbs,
};

export function parseHeroV4Bullets(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatHeroV4Bullets(bullets: string[]): string {
  return bullets.join("\n");
}

function findDefaultHeroV4ServicePill(label: string): HeroV4ServicePill | undefined {
  return defaultHeroV4ServicePills.find((pill) => pill.label === label);
}

export function normalizeHeroV4ServicePills(value: unknown): HeroV4ServicePill[] {
  if (!Array.isArray(value)) {
    return [...defaultHeroV4ServicePills];
  }

  const normalized = value
    .map((item) => {
      if (typeof item === "string") {
        const label = item.trim();
        if (!label) return null;
        return findDefaultHeroV4ServicePill(label) ?? {
          label,
          href: "#services",
          title: `${label} — ${siteConfig.name}`,
          description: `${label} for businesses in Clark County, WA and the Pacific Northwest.`,
        };
      }

      if (!item || typeof item !== "object") return null;

      const record = item as Partial<HeroV4ServicePill>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      if (!label) return null;

      const fallback = findDefaultHeroV4ServicePill(label);

      return {
        label,
        href:
          typeof record.href === "string" && record.href.trim()
            ? record.href.trim()
            : fallback?.href ?? "#services",
        title:
          typeof record.title === "string" && record.title.trim()
            ? record.title.trim()
            : fallback?.title ?? `${label} — ${siteConfig.name}`,
        description:
          typeof record.description === "string" && record.description.trim()
            ? record.description.trim()
            : fallback?.description ??
              `${label} for Clark County, WA businesses and the Pacific Northwest.`,
      };
    })
    .filter((pill): pill is HeroV4ServicePill => pill !== null);

  return normalized.length > 0 ? normalized : [...defaultHeroV4ServicePills];
}

export function normalizeHeroV4PreviewSettings(
  value: Partial<HeroV4PreviewSettings> | null | undefined,
): HeroV4PreviewSettings {
  if (!value || typeof value !== "object") {
    return { ...defaultHeroV4PreviewSettings };
  }

  const bullets = Array.isArray(value.bullets)
    ? value.bullets.map((item) => String(item).trim()).filter(Boolean)
    : defaultHeroV4PreviewSettings.bullets;

  const formTrustNotes = Array.isArray(value.formTrustNotes)
    ? value.formTrustNotes.map((item) => String(item).trim()).filter(Boolean)
    : defaultHeroV4PreviewSettings.formTrustNotes;

  const servicePills = normalizeHeroV4ServicePills(value.servicePills);

  const breadcrumbs = Array.isArray(value.breadcrumbs)
    ? value.breadcrumbs.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const label = typeof item.label === "string" ? item.label.trim() : "";
        if (!label) return [];
        const href = typeof item.href === "string" && item.href.trim() ? item.href.trim() : undefined;
        return [{ label, href }];
      })
    : defaultHeroV4PreviewSettings.breadcrumbs;

  return {
    showForm: value.showForm === true,
    showBreadcrumbs: value.showBreadcrumbs !== false,
    showBullets: value.showBullets === true,
    showPhoneCta: value.showPhoneCta !== false,
    eyebrow:
      typeof value.eyebrow === "string" && value.eyebrow.trim()
        ? value.eyebrow.trim()
        : defaultHeroV4PreviewSettings.eyebrow,
    headline:
      typeof value.headline === "string" && value.headline.trim()
        ? value.headline.trim()
        : defaultHeroV4PreviewSettings.headline,
    body:
      typeof value.body === "string" && value.body.trim()
        ? value.body.trim()
        : defaultHeroV4PreviewSettings.body,
    bullets,
    primaryCtaLabel:
      typeof value.primaryCtaLabel === "string" && value.primaryCtaLabel.trim()
        ? value.primaryCtaLabel.trim()
        : defaultHeroV4PreviewSettings.primaryCtaLabel,
    primaryCtaHref:
      typeof value.primaryCtaHref === "string" && value.primaryCtaHref.trim()
        ? value.primaryCtaHref.trim()
        : defaultHeroV4PreviewSettings.primaryCtaHref,
    phoneLabel:
      typeof value.phoneLabel === "string" && value.phoneLabel.trim()
        ? value.phoneLabel.trim()
        : defaultHeroV4PreviewSettings.phoneLabel,
    phoneHref:
      typeof value.phoneHref === "string" && value.phoneHref.trim()
        ? value.phoneHref.trim()
        : defaultHeroV4PreviewSettings.phoneHref,
    formTitle:
      typeof value.formTitle === "string" && value.formTitle.trim()
        ? value.formTitle.trim()
        : defaultHeroV4PreviewSettings.formTitle,
    formSubtext:
      typeof value.formSubtext === "string"
        ? value.formSubtext.trim()
        : defaultHeroV4PreviewSettings.formSubtext,
    formTrustNotes,
    formLeadSource: normalizeHeroV4FormLeadSourceId(value.formLeadSource),
    showServicePills: value.showServicePills !== false,
    servicePills,
    breadcrumbs,
  };
}
