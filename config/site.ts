export const siteConfig = {
  name: "Spartan Restoration",
  domain: "spartanrestorationnw.com",
  url: "https://spartanrestorationnw.com",
  tagline: "The best defense in water damage.",
  description:
    "Spartan Restoration — The best defense in water damage. Our new site is on the way.",
  phone: "503-975-9082",
  email: "Stonepillarcontractors@gmail.com",
  address: "Vancouver, WA",
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    twitter: "#",
  },
  nav: [{ label: "Home", href: "/" }],
  assets: {
    logo: "/Spartan-Logo-1.JPG",
    logoWhite: "/Spartan-Logo-1.JPG",
    logoBlack: "/Spartan-Logo-1.JPG",
    ogImage: "/Spartan-Logo-1.JPG",
  },
  launch: {
    mode: "under-construction" as "under-construction" | "live",
    previewPlaygroundPath: "/playground",
    previewPath: "/preview",
  },
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
  ],
} as const;

export type SiteConfig = typeof siteConfig;
