export type TeamContact = {
  name: string;
  phone: string;
  email: string;
};

export const siteConfig = {
  name: "Spartan Restoration",
  domain: "spartanrestorationnw.com",
  url: "https://spartanrestorationnw.com",
  tagline: "The best defense in water damage.",
  description:
    "Spartan Restoration — The best defense in water damage. Our new site is on the way.",
  phone: "503-975-9082",
  serviceArea: "Serving Vancouver, WA and the Pacific Northwest",
  email: "Stonepillarcontractors@gmail.com",
  address: "Vancouver, WA",
  /** Optional contacts shown on the under construction page. Falls back to site phone/email when empty. */
  teamContacts: [
    {
      name: "Justin Dauven",
      phone: "503-975-9082",
      email: "Stonepillarcontractors@gmail.com",
    },
    {
      name: "Curt Farber",
      phone: "360-608-6640",
      email: "charlesfarber7111@gmail.com",
    },
  ] as TeamContact[],
  underConstruction: {
    headline: "Under Construction",
    subheadline: "Our new site is on the way.",
    brandTitleLines: ["Spartan", "Restoration"],
  },
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    twitter: "#",
  },
  /** Full site nav — dev/scaffold footers and legacy layouts */
  nav: [
    { label: "Home", href: "/" },
    { label: "Playground", href: "/playground" },
    { label: "Preview", href: "/preview" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  /** Primary marketing nav — headers, footer v3 */
  primaryNav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "#services" },
    { label: "Insurance", href: "#insurance" },
    { label: "Gallery", href: "#gallery" },
  ],
  assets: {
    logo: "/spartan/SpartanLogo.png",
    logoWhite: "/spartan/SpartanLogo.png",
    logoBlack: "/spartan/SpartanLogo.png",
    logoColor: "/spartan/SpartanLogo.png",
    ogImage: "/spartan/SpartanLogo.png",
  },
  launch: {
    mode: "under-construction" as "under-construction" | "live",
    previewPlaygroundPath: "/playground",
    previewPath: "/preview",
  },
} as const;

export type SiteConfig = typeof siteConfig;
