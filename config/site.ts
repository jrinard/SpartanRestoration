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
    "The best defense in water damage. Our new site is on the way.",
  phone: "503-975-9082",
  serviceArea: "Serving Vancouver, WA and Portland, OR and the Pacific Northwest",
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
  /** Footer v1 link row — matches secondary nav labels where possible. */
  footerNav: [
    { label: "Home", href: "/" },
    { label: "Our Services", href: "#services" },
    { label: "Insurance", href: "#insurance" },
    { label: "Gallery", href: "#gallery" },
    { label: "Service Area", href: "#service-area" },
  ],
  designerCredit: {
    label: "LifeSpring Design",
    href: "https://www.lifespringdesign.com/",
  },
  assets: {
    logo: "/spartan/SpartanLogo2.png",
    logoWhite: "/spartan/SpartanLogo2.png",
    logoBlack: "/spartan/SpartanLogo2.png",
    logoColor: "/spartan/SpartanLogo2.png",
    ogImage: "/spartan/SpartanLogo.png",
  },
  launch: {
    mode: "under-construction" as "under-construction" | "live",
    previewPlaygroundPath: "/playground",
    previewPath: "/preview",
  },
} as const;

export type SiteConfig = typeof siteConfig;
