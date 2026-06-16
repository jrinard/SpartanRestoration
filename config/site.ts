export const siteConfig = {
  name: "LifeSpring Design",
  domain: "lifespringdesign.com",
  url: "https://lifespringdesign.com",
  tagline: "Crafting digital experiences that help businesses grow.",
  description:
    "LifeSpring Design builds fast, beautiful marketing websites for businesses ready to grow.",
  phone: "503-555-0100",
  email: "hello@lifespringdesign.com",
  address: "",
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    twitter: "#",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Playground", href: "/playground" },
    { label: "Preview", href: "/preview" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  assets: {
    logo: "/logo.png",
    logoWhite: "/LS-logo-white.png",
    logoBlack: "/LS-logo-black.png",
    ogImage: "/ls-logo-color.png",
  },
  launch: {
    mode: "under-construction" as "under-construction" | "live",
    previewPlaygroundPath: "/playground",
    previewPath: "/preview",
  },
} as const;

export type SiteConfig = typeof siteConfig;
