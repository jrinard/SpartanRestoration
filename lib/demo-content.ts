import { siteConfig } from "@/config/site";

export const heroDemo = {
  headline: siteConfig.name,
  lines: ["Expert", "Design", "Partners"],
  subtext: "Grow your business. Reach your goals. Enjoy the process.",
  ctaLabel: "Start a Conversation",
  ctaHref: "/contact",
};

export const projects = [
  { title: "Riverside Bistro", tags: "Branding, Website Design, Menu Design" },
  { title: "Summit Legal Group", tags: "Website Design, SEO, Content" },
  { title: "Valley Health Co-op", tags: "Branding, Website Design" },
  { title: "Bright Path Learning", tags: "Website Design, Graphic Design" },
];

export const featureTiles = [
  {
    title: "Projects",
    subtext: "Browse recent work across branding, web design, and digital strategy.",
    href: "/projects",
    imageAlt: "Projects",
  },
  {
    title: "Team",
    subtext: "Get to know the people behind LifeSpring Design.",
    href: "/about",
    imageAlt: "Team",
  },
  {
    title: "Resources",
    subtext: "Articles, guides, and tools for building a stronger online presence.",
    href: "/blog",
    imageAlt: "Resources",
  },
];

export const testimonials = [
  {
    quote:
      "LifeSpring Design listened closely, moved quickly, and delivered a site that finally feels like us.",
    name: "Northline Studio",
    role: "Creative Agency",
  },
  {
    quote:
      "The process was smooth from start to finish. Our new site looks polished and is easy to update.",
    name: "Harbor & Co.",
    role: "Retail Brand",
  },
  {
    quote:
      "They explained everything clearly and built a site we are proud to share with customers.",
    name: "Red Oak Dental",
    role: "Healthcare Practice",
  },
  {
    quote:
      "Professional, responsive, and detail-oriented. We saw a real difference after launch.",
    name: "Fieldstone Builders",
    role: "Construction Company",
  },
];

export const simpleServices = [
  {
    title: "Web Design",
    description: "Beautiful, responsive websites tailored to your brand.",
    icon: "🎨",
  },
  {
    title: "Development",
    description: "Fast, modern sites built with Next.js and best practices.",
    icon: "⚡",
  },
  {
    title: "SEO",
    description: "Search-optimized architecture from day one.",
    icon: "🔍",
  },
];

export const iconServices = [
  {
    title: "Website Design",
    description: "Custom layouts built to represent your brand and convert visitors.",
    icon: "🌐",
  },
  {
    title: "Branding",
    description: "Visual identity and messaging that feel cohesive across every touchpoint.",
    icon: "✦",
  },
  {
    title: "Digital Marketing",
    description: "Search, ads, and content strategy to help the right people find you.",
    icon: "📈",
  },
  {
    title: "Graphic Design",
    description: "Print and digital assets designed to look polished everywhere they appear.",
    icon: "🎨",
  },
  {
    title: "Video Production",
    description: "Short-form video and motion content for web and social.",
    icon: "🎬",
  },
  {
    title: "Marketing Partnerships",
    description: "A dedicated team invested in your growth, not just a one-off project.",
    icon: "🤝",
  },
];

export const detailedServices = [
  {
    title: "Website Design",
    description:
      "From first wireframe to final launch, we create websites that are clear, modern, and built around your goals.",
    bullets: [
      "Custom layouts for your brand",
      "Mobile-friendly by default",
      "Fast, maintainable builds",
      "Launch support and training",
    ],
  },
  {
    title: "Branding",
    description:
      "Strong brands start with clarity. We help you define a look and voice that customers remember.",
    bullets: [
      "Audience and positioning support",
      "Messaging direction",
      "Logo and visual identity",
      "Guidelines for future design",
    ],
  },
  {
    title: "SEO & Digital Marketing",
    description: "Get found by the people already looking for what you offer.",
    bullets: [
      "On-page SEO foundations",
      "Local search strategy",
      "Performance reporting",
      "Content and social support",
    ],
  },
];

export const storyPanels = [
  {
    setup: "In every success story, someone has to lead the way.",
    punchline: "In yours, that is you.",
  },
  {
    setup: "Even the best leaders need someone in their corner.",
    punchline: "That is where we come in.",
  },
];

export const narrativeContent = {
  heading: "Building Your Presence Should Feel Like Momentum",
  body: "Growing a business online is a lot like setting out on a long trip. Without a clear route, it is easy to burn time, spend more than you planned, and lose confidence along the way. The right partner helps turn that uncertainty into steady progress—and makes the work feel worth doing.",
  ctaLabel: "How we help",
  ctaHref: "/about",
};

export const storyFrameClosing = {
  heading: "The right partner changes how the work feels.",
  body: "When you have a team that knows the terrain, you get sharper results, fewer dead ends, and a process that is far easier to stay excited about.",
};

export const partnerLogos = [
  "Client One",
  "Client Two",
  "Client Three",
  "Client Four",
  "Client Five",
];

export const ctaContent = {
  headline: "Ready to grow your business?",
  subtext: "Let us talk about what you are building and what comes next.",
  ctaLabel: "Contact Us",
  ctaHref: "/contact",
};

export const logoBarHeading = "Companies We Work With";

export const servicesIconsHeading = "Our Services";

export const servicesIconsSubheading = `${siteConfig.name} offers design, development, and marketing support under one roof. Tell us what you need—we will help you get there.`;

/** OSP-style washing demo content — paraphrased placeholders for preview. */
export const washingHero = {
  headline: "Professional Pressure & Soft Washing in Vancouver & Portland",
  serviceAreas: "Servicing Vancouver, Portland and surrounding areas",
  leadText: "Servicing Vancouver, Portland and surrounding areas",
  quoteLabel: "Get a Free Quote",
  quoteHref: "/contact",
  phoneLabel: siteConfig.phone || "503-555-0100",
  phoneHref: `tel:${(siteConfig.phone || "5035550100").replace(/\D/g, "")}`,
  backgroundImage: "/osp/pic-banner3.jpeg",
};

export const washingFlipCards = [
  {
    id: "residential",
    frontLabel: "Residential Washing",
    title: "Residential Washing",
    variant: "dark" as const,
    frontImage: "/osp/pic-pressure3.jpeg",
    bullets: [
      "House Soft Washing (Siding Cleaning)",
      "Roof Soft Washing (Moss & Algae Treatment)",
      "Driveway & Walkway Cleaning",
      "Gutter Cleaning & Gutter Brightening",
      "Deck & Fence Cleaning",
    ],
  },
  {
    id: "commercial",
    frontLabel: "Commercial Washing",
    title: "Commercial Washing",
    variant: "medium" as const,
    frontImage: "/osp/pic-commercial3.jpeg",
    bullets: [
      "Building Exteriors",
      "Roof & High Areas",
      "Concrete & Hard Surfaces",
      "Gutter & Drainage Systems",
      "Entryways & High Traffic Zones",
      "Specialty & Safety Cleaning",
    ],
  },
  {
    id: "organic",
    frontLabel: "Organic Growth Management",
    frontLines: ["Organic Growth", "Management"],
    title: "Organic Growth Management",
    variant: "light" as const,
    frontImage: "/osp/Organic_management.jpeg",
    paragraph:
      "Organic Growth Management includes removing and preventing moss, algae, mildew, and other biological buildup on exterior surfaces. This helps protect your property from slip-and-fall hazards, reduces liability risk, and prevents costly long-term surface damage.",
  },
];

export const fourFlipCards = [
  ...washingFlipCards,
  {
    id: "seal-coating",
    frontLabel: "Seal Coating",
    title: "Seal Coating",
    variant: "accent" as const,
    frontImage: "/osp/pic-commercial3.jpeg",
    bullets: [
      "Driveway & walkway seal coating",
      "Concrete surface protection",
      "Paver sealing & preservation",
      "UV & moisture barrier treatment",
      "Extended surface life & color retention",
    ],
  },
];

export const washingServiceSections = [
  {
    id: "pressure-washing",
    title: "Residential Pressure & Soft Washing",
    paragraphs: [
      "Our pressure washing services make it easy to keep your home clean, safe, and looking great. Dirt, mold, mildew, and algae build up naturally over time, especially on roofs, siding, and concrete. Left alone, that buildup can stain surfaces and cause long-term damage. We're here to take care of it the right way.",
      "We use a mix of soft washing and pressure washing depending on the surface. That means gentle cleaning for roofs and siding, and stronger cleaning where it's needed for concrete and pavers. The goal is simple: get everything clean without damaging your home.",
      "Pressure washing is one of the easiest ways to boost curb appeal and protect your property. Whether you're getting ready to sell, hosting guests, or just want your place to look better, we've got you covered.",
    ],
    servicesLabel: "Services include:",
    services: [
      "House Soft Washing (Siding Cleaning)",
      "Roof Soft Washing (Moss & Algae Treatment)",
      "Driveway & Walkway Cleaning",
      "Gutter Cleaning & Gutter Brightening",
      "Deck & Fence Cleaning",
    ],
    reverse: false,
    imageSrc: "/osp/Driveway_Before_After_SideBySide.jpg",
    imageAlt: "Professional pressure washing service cleaning exterior surfaces",
    imageVariant: "photo" as const,
  },
  {
    id: "commercial-cleaning",
    title: "Commercial Pressure & Soft Washing",
    paragraphs: [
      "A clean building sends the right message. Our commercial cleaning services help businesses, property managers, and HOAs keep their properties looking professional and well-maintained. From storefronts to larger commercial spaces, we handle the exterior cleaning so you don't have to.",
      "We know your time matters. That's why we show up when we say we will, work efficiently, and clean up after ourselves. Our team uses safe, effective cleaning methods that remove dirt, grime, and organic growth without damaging surfaces.",
      "Regular commercial pressure washing not only improves appearance, but also helps prevent slip hazards and reduces long-term maintenance costs. It's a simple way to protect your investment and keep your property welcoming year-round.",
    ],
    servicesLabel: "Services include:",
    services: [
      "Building Exteriors",
      "Roof & High Areas",
      "Concrete & Hard Surfaces",
      "Gutter & Drainage Systems",
      "Entryways & High Traffic Zones",
      "Specialty & Safety Cleaning",
    ],
    reverse: true,
    imageSrc: "/osp/pic-commercial3.jpeg",
    imageAlt: "Commercial building exterior cleaning service",
    imageVariant: "commercial" as const,
  },
  {
    id: "organic-growth",
    title: "Organic Growth Management",
    paragraphs: [
      "Removing organic growth from walkways and exterior structures is important because it helps prevent slip-and-fall hazards. Moss, algae, and mildew can create slick surfaces, especially in wet or shaded areas, increasing the risk of injury for residents, customers, and visitors.",
      "Organic buildup also breaks down surfaces over time. Moisture-retaining growth can accelerate the deterioration of concrete, wood, and roofing materials, leading to cracking, staining, and premature aging that results in higher repair and replacement costs.",
      "Regular removal of organic growth helps maintain a property's appearance and value. Clean, well-maintained walkways and structures improve curb appeal, support a professional image, and show proactive care that benefits both safety and long-term property condition.",
    ],
    servicesLabel: "Services include:",
    services: [
      "Moss, Algae & Mildew Removal & Prevention",
      "Biological Buildup on Exterior Surfaces",
      "Slip-and-Fall Hazard Protection",
      "Liability Risk Reduction",
      "Long-Term Surface Damage Prevention",
    ],
    reverse: false,
    imageSrc: "/osp/Excess_growth.jpg",
    imageAlt: "Organic growth on exterior surfaces before treatment",
    imageVariant: "organic" as const,
  },
];

export const washingTestimonials = [
  {
    name: "Steve H",
    quote:
      "OS Pressure / Soft Washing far exceeded my expectations. Gutters cleaned, siding and walkway / driveway looks amazing for a 25 year old Camas home. The crew listened to my concerns about past work, and did well to make sure the job was done to my requests. I highly recommend this company for your home / gutters / driveway cleaning.",
    rating: 5,
  },
  {
    name: "Gabriel J",
    href: "https://www.unitedhive.com/",
    quote:
      "Very impressed with the professionalism, speed, and quality of the OS team! They helped get my deck ready for summer and it looks great. Highly recommend!",
    rating: 5,
  },
  {
    name: "Joshua R",
    href: "https://www.lifespringdesign.com/",
    quote:
      "Tim did a great Job. I asked him to wash the moss off my house and he also completely cleaned my driveway and walkways! Above and beyond for sure. I was blown away at how clean that concrete looks now. My neighbors walkways look so dull now. I didn't even know I needed it. Will use again for sure. Thanks",
    rating: 5,
  },
  {
    name: "Aspen Group NW",
    href: "https://www.aspengroupnw.com/",
    quote:
      "I use OS Pressure and Soft Washing exclusively for my projects. Running a business and having a quality company like OS I can rely on to show up and get the job done above and beyond my expectations makes all the difference. I don't need the worry of if they are going to show up on time or getting the job done right. The peace of mind is priceless. I'll keep my relationship with them for years to come. Thanks for always getting the job done.",
    rating: 5,
  },
];

export const associationLogos = [
  {
    src: "/osp/BIA_LOGO.png",
    alt: "Building Industry Association logo",
  },
  {
    src: "/osp/biaw-color-logo-300x113.png",
    alt: "Building Industry Association of Washington logo",
  },
  {
    src: "/osp/nahb-logo-color-768x538.png",
    alt: "National Association of Home Builders logo",
  },
];

export const associationNetwork = {
  label: "Home & Life Vendor network",
  href: "https://shastinebredlie.lofty.me/home-and-life-vendor-network",
};

export const associationHeading = "Proud member of the BIA, BIAW, NAHB";

export const washingFooter = {
  hours: [
    "Monday - Friday: 8:00 AM - 6:00 PM",
    "Saturday: 9:00 AM - 4:00 PM",
    "Sunday: Closed",
  ],
  serviceLinks: [
    { label: "Pressure Washing", href: "#pressure-washing" },
    { label: "Roof Cleaning", href: "#pressure-washing" },
    { label: "House Washing", href: "#pressure-washing" },
    { label: "Concrete Cleaning", href: "#pressure-washing" },
    { label: "Paver Cleaning", href: "#pressure-washing" },
    { label: "Gutter Cleaning", href: "#pressure-washing" },
    { label: "Commercial Cleaning", href: "#commercial-cleaning" },
    { label: "Organic Growth Management", href: "#organic-growth" },
  ],
  licenses: [
    "Oregon Department of Agriculture License #AG-L1103370CPA",
    "WA Contractors License #OSPREPW741CJ",
  ],
};
