import { siteConfig } from "@/config/site";
import { phoneTelHref } from "@/lib/phone";
import type { SiteIconName } from "@/lib/site-icons";

export const heroDemo = {
  headline: siteConfig.name,
  lines: ["Expert", "Design", "Partners"],
  subtext: "Grow your business. Reach your goals. Enjoy the process.",
  ctaLabel: "Let's Talk",
  ctaHref: "/contact",
};

export const heroV21Demo = {
  headlineLines: ["Technology That Works", "The Way Your Business Works"],
  subtextLines: [
    "Custom websites, software, and digital solutions that solve real business problems so you can focus on what you do best.",
    "Built around your goals, your workflow, and the way your business operates.",
    "A trusted technology partner helping your business grow with confidence.",
    "From websites to custom software, we create solutions that move your business forward.",
  ],
  ctaLabel: "Let's Talk",
  ctaHref: "/contact",
  highlights: [
    {
      title: "Websites That Grow Your Business",
      description:
        "Build trust, attract customers, and create a strong online presence with a website designed around your goals.",
      href: "#services",
    },
    {
      title: "Get More Customer Reviews",
      description:
        "Turn happy customers into positive Google reviews and build trust with future customers.",
      href: "#reviewbox",
    },
  ],
};

export const projects = [
  {
    title: "OS Power and Softwash",
    tags: "Website Design, Pressure Washing",
    description:
      "Keep your home clean and protected with the right mix of soft washing and pressure washing for roofs, siding, and concrete. We remove dirt, mold, and buildup without damaging your surfaces—boosting curb appeal and protecting your property.",
    href: "https://ospnwcleanpros.com/",
    imageSrc: "/lsd/portfolio-sites/ospower-example.png",
    imageAlt:
      "OS Power and Softwash pressure washing website homepage designed by LifeSpring Design",
  },
  {
    title: "Reviewbox.io",
    tags: "Product Design, Review Software",
    description:
      "Reviewbox simplifies online reviews by texting customers a direct link so they can leave a rating in seconds. It helps you build a consistent five-star reputation by reminding happy customers to share their positive experiences.",
    href: "https://reviewbox.io",
    imageSrc: "/lsd/rvbx-example-desktop.png",
    imageAlt: "Reviewbox.io review management software dashboard designed by LifeSpring Design",
  },
  {
    title: "Genesis Feed Products",
    tags: "Website Design, Organic Agriculture",
    href: "https://genesisfeedproducts.com/",
    imageSrc: "/lsd/portfolio-sites/gfp-example.png",
    imageAlt: "Genesis Feed Products organic agriculture website designed by LifeSpring Design",
  },
  {
    title: "Content Management System",
    tags: "Custom Software Solution",
    description:
      "A custom Ruby on Rails CRM for customer management with HappyFox and QuickBooks integrations, dark/light themes, and a Kanban board for sales workflows.",
    imageSrc: "/lsd/portfolio-sites/port-crm-example.jpg",
    imageAlt:
      "Custom Ruby on Rails CRM dashboard with Kanban board built by LifeSpring Design",
  },
  {
    title: "Gold Co Idaho Classic",
    tags: "Website Design",
    imageSrc: "/lsd/portfolio-sites/port-example-gold.png",
    imageAlt: "Gold Co Idaho Classic event website homepage designed by LifeSpring Design",
  },
  {
    title: "Phonefixation",
    tags: "Website Design, Mobile Repair",
    imageSrc: "/lsd/portfolio-sites/PhoneFix-example.png",
    imageAlt: "Phonefixation mobile repair shop website designed by LifeSpring Design",
  },
  {
    title: "Eternal Zoe Design",
    tags: "Website Design, Branding",
    imageSrc: "/lsd/portfolio-sites/port-zoe-example.png",
    imageAlt: "Eternal Zoe Design interior design website and branding by LifeSpring Design",
  },
  {
    title: "Momentum",
    tags: "Team and Event Management",
    description:
      "Momentum is a new software project that allows non profit organizations or social movements to organize their internal structure.",
    stack: "Made with Ruby on Rails, HTML, CSS, JavaScript, Heroku.",
    imageSrc: "/lsd/portfolio-sites/port-mom-example.jpg",
    imageAlt: "Momentum nonprofit team management web application by LifeSpring Design",
  },
  {
    title: "Port Closet",
    tags: "Custom Software, Inventory",
    description:
      "Closets helps you remember what you wore and when. Store selfies, outfit details, dates, and events—then search by date or save favorites. Built mobile-first for easy use on the go.",
    stack: "Made with Ruby on Rails, HTML, CSS, JavaScript, Heroku, AWS.",
    imageSrc: "/lsd/portfolio-sites/port-closet-example.jpg",
    imageAlt: "Port Closet wardrobe tracking mobile web app by LifeSpring Design",
  },
  {
    title: "Blue Lakes Inn Boutique Hotel",
    tags: "Website Design, Branding",
    description:
      "A boutique hotel in southern Idaho offering short-term and extended stays.",
    href: "https://bluelakesinn.com/",
    imageSrc: "/lsd/portfolio-sites/port-bli-example.jpg",
    imageAlt: "Blue Lakes Inn Boutique Hotel website homepage designed by LifeSpring Design",
  },
  {
    title: "Stoken Joe Coffee",
    tags: "Website Design, Branding, Print Advertising, Packaging",
    imageSrc: "/lsd/portfolio-sites/port-stoken-example.jpg",
    imageAlt: "Stoken Joe Coffee website and branding designed by LifeSpring Design",
  },
  {
    title: "Orpheum Theater",
    tags: "Website Design, Branding",
    imageSrc: "/lsd/portfolio-sites/port-orph-example.png",
    imageAlt: "Orpheum Theater website and branding designed by LifeSpring Design",
  },
];

export const brandingProjects = [
  {
    title: "Branding Project 1",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-1.png",
    imageAlt: "Logo and brand identity design portfolio sample 1 by LifeSpring Design",
  },
  {
    title: "Branding Project 2",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-2.png",
    imageAlt: "Logo and brand identity design portfolio sample 2 by LifeSpring Design",
  },
  {
    title: "Branding Project 3",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-3.png",
    imageAlt: "Print and packaging brand design portfolio sample 3 by LifeSpring Design",
  },
  {
    title: "Branding Project 4",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-4.png",
    imageAlt: "Print and packaging brand design portfolio sample 4 by LifeSpring Design",
  },
  {
    title: "Branding Project 5",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-5.png",
    imageAlt: "Business branding and marketing design portfolio sample 5 by LifeSpring Design",
  },
  {
    title: "Branding Project 6",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-6.png",
    imageAlt: "Business branding and marketing design portfolio sample 6 by LifeSpring Design",
  },
  {
    title: "Branding Project 7",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-7.png",
    imageAlt: "Visual identity and logo design portfolio sample 7 by LifeSpring Design",
  },
  {
    title: "Branding Project 8",
    tags: "Branding",
    imageSrc: "/lsd/portfolio_images/port-brand-8.png",
    imageAlt: "Visual identity and logo design portfolio sample 8 by LifeSpring Design",
  },
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
      "LifeSpring built our website and made the whole process straightforward. The site looks professional and we finally feel proud to send people there.",
    name: "OS Power and Softwash",
    role: "Pressure Washing · Vancouver, WA",
  },
  {
    quote:
      "Josh and the team listened to what we needed, moved quickly, and delivered software that actually fits how we work.",
    name: "Genesis Feed Products",
    role: "Organic Agriculture · Idaho",
  },
  {
    quote:
      "From branding to the live site, LifeSpring helped us look polished online without overcomplicating things.",
    name: "Blue Lakes Inn",
    role: "Boutique Hotel · Southern Idaho",
  },
  {
    quote:
      "Responsive, clear, and detail-oriented. Our new presence online matches the quality we want customers to expect.",
    name: "Phonefixation",
    role: "Mobile Repair",
  },
];

/** LifeSpring services — used by Services-v1 and future service sections */
export const simpleServices = [
  {
    title: "Websites That Represent Your Business",
    description:
      "Websites designed to attract customers, build trust, and represent your business online.",
    icon: "/lsd/demo-website-design.png",
    iconAlt: "Website design and development service icon",
    bullets: [
      "Custom website design",
      "Mobile-friendly development",
      "Hosting and maintenance",
      "Security updates",
      "Ongoing improvements",
    ],
  },
  {
    title: "Custom Software Built Around Your Workflow",
    description:
      "Stop adapting your business to software. We build tools that fit the way you already work.",
    icon: "/lsd/demo-custom-soft.png",
    iconAlt: "Custom software development service icon",
    bullets: [
      "Internal business applications",
      "Customer portals",
      "Custom dashboards",
      "Workflow tools",
      "Business process solutions",
    ],
  },
  {
    title: "Grow Business Reputation with Reviewbox.io",
    description:
      "to consistently get better quality Google reviews for building a better online reputation.",
    icon: "/lsd/Reviewbox-logo.png",
    iconAlt: "Reviewbox.io online review management software logo",
    productLink: { label: "Reviewbox.io", href: "https://reviewbox.io" },
    bullets: [
      "Simple, clean review requests at the right moment",
      "Google, Yelp, and Facebook in one simple flow",
      "Custom review templates",
      "Multi-location support and team management",
      "Statistics and reputation insights",
    ],
  },
  {
    title: "Graphic Design & Brand Support",
    description:
      "Professional designs that help your business stand out and create a consistent brand.",
    icon: "/lsd/Square-2026.jpg",
    iconAlt: "Graphic design and brand support service icon",
    bullets: [
      "Logos and branding materials",
      "Business cards and print materials",
      "Social media graphics",
      "Marketing materials",
      "Custom digital designs",
    ],
  },
  {
    title: "Ongoing Technology Support",
    description:
      "Your business changes over time. We help your technology evolve with it through ongoing updates, improvements, and support.",
    icon: "/lsd/demo-icon-dia-green.png",
    iconAlt: "Ongoing technology support service icon",
    bullets: [
      "Website updates",
      "Software improvements",
      "Security maintenance",
      "Feature enhancements",
      "Ongoing technical support",
    ],
  },
];

export const servicesV1Cta = {
  headline: "Great businesses need a trusted developer.",
  text: "We can help you.",
  ctaLabel: "Let's Go",
  ctaHref: heroDemo.ctaHref,
};

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
  "OS Power and Softwash",
  "Genesis Feed Products",
  "Reviewbox.io",
  "Blue Lakes Inn",
  "Phonefixation",
  "Gold Co Idaho Classic",
];

export const ctaContent = {
  headlineLines: [
    "With years of experience,",
    "our leadership team is always ready",
    "to solve your problem",
  ],
  phoneLabel: siteConfig.phone,
  phoneHref: phoneTelHref(siteConfig.phone),
};

/** Legacy CTA-v2 copy — generic contact prompt. */
export const ctaV2Content = {
  headline: "Ready to grow your business?",
  subtext: "Let us talk about what you are building and what comes next.",
  ctaLabel: "Contact Us",
  ctaHref: "/contact",
};

export const contactContent = {
  title: "Let's Talk",
  subtext: "Let's start the conversation with a Free Consultation",
  phonePrefix: "Call us at",
  formDivider: "or",
  formIntro: "Send us a message",
};

export const reviewboxContent = {
  logoSrc: "/lsd/Reviewbox-logo.png",
  logoAlt: "Reviewbox.io logo — online review management software",
  headlineLines: ["Better reviews.", "Less effort."],
  subtext:
    "helps your customers leave consistent, quality reviews on Google, Yelp, and Facebook—so your reputation keeps growing while you stay focused on the work.",
  productLink: {
    label: "Reviewbox",
    href: "https://reviewbox.io",
  },
  bullets: [
    "Simple, clean review requests at the right moment",
    "Google, Yelp, and Facebook in one simple flow",
    "Built for local businesses that care about reputation",
  ],
  features: [
    "Multi-location support",
    "Custom review templates",
    "Statistics & insights",
    "Team management",
  ],
  featuresLabel: "Also includes",
  ctaLabel: "Sign up",
  ctaSubtext: "Free for 30 days. No card required.",
  ctaHref: "https://reviewbox.io",
  desktop: {
    imageSrc: "/lsd/rvbx-example-desktop.png",
    imageAlt: "Reviewbox.io review management dashboard on desktop",
  },
  leftExample: {
    imageSrc: "/lsd/rvbx-os-example.png",
    imageAlt: "Reviewbox.io review request widget on a local business website",
  },
  rightMessage: {
    imageSrc: "/lsd/rvbx-example-message-send.png",
    imageAlt: "Reviewbox.io SMS review request message on a mobile phone",
  },
};

export const logoBarHeading = "Companies We Work With";

export const servicesIconsHeading = "Our Services";

export const servicesIconsSubheading = `${siteConfig.name} offers design, development, and marketing support under one roof. Tell us what you need—we will help you get there.`;

export const servicesIconsV2Heading = "Our Services";

export const servicesIconsV2SeoDescription = `${siteConfig.name} provides emergency water damage restoration, mold remediation, structural drying, and insurance claim support in Vancouver, WA and Portland, OR.`;

export const servicesIconsV2Services: ReadonlyArray<{
  id: string;
  title: string;
  icon: SiteIconName;
  description: string;
}> = [
  {
    id: "water-mitigation",
    title: "Water Mitigation & Extraction",
    icon: "droplets",
    description: "Emergency water mitigation and extraction for flooded properties.",
  },
  {
    id: "structural-drying",
    title: "Structural Drying",
    icon: "wind",
    description: "Structural drying and dehumidification to prevent secondary damage.",
  },
  {
    id: "mold-remediation",
    title: "Mold Remediation",
    icon: "biohazard",
    description: "Mold remediation and microbial treatment for affected structures.",
  },
  {
    id: "hepa-vacuum",
    title: "HEPA Vacuum & Air Scrubbing",
    icon: "fan",
    description: "HEPA vacuuming and air scrubbing to improve indoor air quality.",
  },
  {
    id: "cleaning-sanitization",
    title: "Cleaning & Sanitization",
    icon: "sparkles",
    description: "Structural cleaning and sanitization after water or fire damage.",
  },
  {
    id: "flood-cleanup",
    title: "Flood Damage Cleanup",
    icon: "waves",
    description: "Flood damage cleanup for residential and commercial properties.",
  },
  {
    id: "moisture-mapping",
    title: "Moisture Mapping & Inspection",
    icon: "scan-search",
    description: "Moisture mapping and inspections to locate hidden water damage.",
  },
  {
    id: "odor-removal",
    title: "Odor Removal",
    icon: "air-vent",
    description: "Odor removal and air treatment after restoration work.",
  },
  {
    id: "insurance-claims",
    title: "Insurance Claim Support",
    icon: "clipboard-check",
    description: "Insurance documentation and claim support throughout your project.",
  },
  {
    id: "demolition",
    title: "Demolition & Debris Removal",
    icon: "hammer",
    description: "Demolition of water-damaged materials and debris removal.",
  },
  {
    id: "contents-protection",
    title: "Contents Protection",
    icon: "package",
    description: "Contents protection and jobsite containment during restoration.",
  },
];

export const servicesIconsV2Cta = {
  label: siteConfig.phone,
  href: `tel:${siteConfig.phone.replace(/\D/g, "")}`,
};

export const serviceAreaV1Heading = "Areas we service";

export const serviceAreaV1Locations = [
  { id: "vancouver", label: "Vancouver" },
  { id: "camas", label: "Camas" },
  { id: "washougal", label: "Washougal" },
  { id: "woodland", label: "Woodland" },
  { id: "la-center", label: "La Center" },
  { id: "portland", label: "Portland" },
] as const;

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

export const spartanTextIconsContent = {
  heading: "Why Choose Spartan Restoration?",
  subheading:
    "Water and mold damage move fast. Your restoration team should too. Spartan Restoration serves Vancouver and the Pacific Northwest with the urgency and care a damaged home deserves.",
  items: [
    {
      id: "why-emergency-response",
      icon: "phone",
      title: "24/7 Emergency Response",
      description:
        "A live person answers day or night. When you're facing damage, you get a real response, not a voicemail loop.",
    },
    {
      id: "why-quality",
      icon: "sparkles",
      title: "Quality You Can See",
      description:
        "We keep you informed from the first visit through completion, with work built to last, not just look good on day one.",
    },
    {
      id: "why-licensed",
      icon: "shield-check",
      title: "Licensed, Insured & Certified",
      description:
        "Fully insured crews trained to IICRC industry standards, so your property is in qualified hands from start to finish.",
    },
  ] as ReadonlyArray<{
    id: string;
    icon: SiteIconName;
    title: string;
    description: string;
  }>,
};

export const spartanTextImageContent = {
  eyebrow: "Spartan Restoration.",
  headlineLines: [
    "24/7 Emergency Restoration",
    "You Can Count On Water,",
    "Fire & Mold Damage",
  ],
  body:
    "Disasters don't wait for business hours — and neither do we. Spartan Restoration is a locally trusted emergency restoration company serving Vancouver and the Pacific Northwest. Our crews bring clear communication, steady leadership, and hands-on experience to every job, from the first call through final walkthrough.",
  phoneLabel: siteConfig.phone,
  phoneHref: phoneTelHref(siteConfig.phone),
  imageSrc: "/spartan/Sample-Content-Image.png",
  imageAlt: "Spartan Restoration team responding to a property emergency",
  sidebarText:
    "We help navigate your insurance claim | Certified technicians |  Professional drying and remediation equipment.",
};

const spartanSampleContentImageWhite = "/spartan/library/sample-content-image-white.png";

export const spartanTextImagesContent = {
  row1: {
    eyebrow: "Quick. Reliable. Professional.",
    headlineLines: ["Water Damage Restoration"],
    body:
      "Water damage rarely comes with a warning. Spartan Restoration offers 24/7 response across Vancouver and the Pacific Northwest, with experienced crews ready to mobilize quickly. We work to stabilize your property, limit further loss, and guide you through cleanup with clear communication and as little disruption as possible.",
    imageSrc: spartanSampleContentImageWhite,
    imageAlt: "Spartan Restoration crew responding to water damage",
  },
  row2: {
    title: "Mold Remediation",
    body:
      "Mold can trigger allergies, respiratory issues, and lasting damage to building materials when it is left untreated. It spreads quickly—often after leaks, floods, or hidden moisture—and proper remediation requires containment and experienced handling to help prevent cross-contamination. Spartan Restoration's certified crews assess the full scope, remove affected materials safely, and work to restore healthy indoor air quality for your home or business.",
    imageSrc: spartanSampleContentImageWhite,
    imageAlt: "Professional mold remediation on a residential property",
  },
  row3: {
    title: "Storm & Sewage Cleanup",
    body:
      "Pacific Northwest storms can overwhelm roofs, windows, and drainage systems fast—and sewage backups create serious health risks that need immediate attention. Spartan Restoration responds around the clock to extract water, dry affected areas, sanitize contaminated spaces, and help protect your property from further damage with clear communication every step of the way.",
    phoneLabel: siteConfig.phone,
    phoneHref: phoneTelHref(siteConfig.phone),
    imageSrc: spartanSampleContentImageWhite,
    imageAlt: "Storm and sewage damage cleanup in progress",
  },
};
