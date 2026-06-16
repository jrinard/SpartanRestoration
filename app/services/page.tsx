import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServicesV1 } from "@/components/sections/Services-v1";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.services.title,
  description: pageSeo.services.description,
  path: pageSeo.services.path,
  noIndex: pageSeo.services.noIndex,
});

const placeholderServices = [
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

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <h1 className="sr-only">Our Services</h1>
        <ServicesV1
          heading="Our Services"
          subheading="Placeholder content — customize per client."
          services={placeholderServices}
        />
      </main>
      <Footer />
    </>
  );
}
