export type TeamContact = {
  name: string;
  phone: string;
  email: string;
};

export type SiteNavLink = {
  label: string;
  href: string;
};

export type SiteConfigData = {
  name: string;
  domain: string;
  url: string;
  tagline: string;
  description: string;
  phone: string;
  serviceArea: string;
  /** City-level service areas for local SEO (optional; LSD uses this). */
  serviceAreas?: string[];
  /** City-level location for structured data when no street address is set. */
  locality?: {
    city: string;
    region: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  email: string;
  /** Legal entity on privacy/terms pages. Defaults to `${name} LLC`. */
  legalEntityName?: string;
  address: string;
  teamContacts: TeamContact[];
  underConstruction: {
    headline: string;
    subheadline: string;
    brandTitleLines?: string[];
    /** Optional lockup for the under-construction page (defaults to assets.logo). */
    logo?: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
  nav: SiteNavLink[];
  primaryNav: SiteNavLink[];
  footerNav: SiteNavLink[];
  designerCredit: {
    label: string;
    href: string;
  };
  /** Footer v1 — optional link below the tagline. Clear label or href to hide. */
  footerTaglineLink?: {
    label: string;
    href: string;
  };
  assets: {
    logo: string;
    logoWhite: string;
    logoBlack: string;
    logoColor: string;
    ogImage: string;
    favicon: string;
    appleTouchIcon: string;
    themeFolder: string;
  };
  launch: {
    mode: "under-construction" | "live";
    previewPlaygroundPath: string;
    previewPath: string;
  };
};

export const fallbackSiteConfig: SiteConfigData = {
  name: "LifeSpring Design",
  domain: "lifespringdesign.com",
  url: "https://lifespringdesign.com",
  tagline: "Crafting digital experiences that help you grow.",
  description:
    "LifeSpring Design builds custom websites, software, and branding for businesses in Washington, Oregon, and Idaho.",
  phone: "208-316-8338",
  serviceArea: "Serving Washington, Oregon, Idaho",
  email: "josh@lifespringdesign.com",
  address: "",
  teamContacts: [
    { name: "Justin Dauven", phone: "503-975-9082", email: "" },
    { name: "Curt Farber", phone: "360-608-6640", email: "" },
  ],
  underConstruction: {
    headline: "Under Construction",
    subheadline: "Our new site is on the way.",
  },
  social: {
    facebook: "https://www.facebook.com/lifespringdesign/",
    instagram: "#",
    linkedin: "#",
    twitter: "#",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Forge", href: "/forge" },
    { label: "Preview", href: "/preview" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Service Areas", href: "/service-areas" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  primaryNav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#portfolio" },
    { label: "Contact", href: "/contact" },
  ],
  footerNav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Projects", href: "#portfolio" },
    { label: "Contact", href: "/contact" },
  ],
  designerCredit: {
    label: "LifeSpring Design",
    href: "https://www.lifespringdesign.com/",
  },
  assets: {
    logo: "/org-assets/lsd/logo.png",
    logoWhite: "/org-assets/lsd/LS-logo-white.png",
    logoBlack: "/org-assets/lsd/LS-logo-black.png",
    logoColor: "/org-assets/lsd/LS_Logo_Color.png",
    ogImage: "/org-assets/lsd/LS-logo-color.png",
    favicon: "/org-assets/lsd/ls-favicon-32.png",
    appleTouchIcon: "/org-assets/lsd/ls-favicon-180.png",
    themeFolder: "lsd",
  },
  launch: {
    mode: "under-construction",
    previewPlaygroundPath: "/forge",
    previewPath: "/preview",
  },
};
