import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServicesV1 } from "@/components/sections/Services-v1";
import { simpleServices, servicesV1Cta } from "@/lib/demo-content";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.services.title,
  description: pageSeo.services.description,
  path: pageSeo.services.path,
});

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <h1 className="sr-only">Services</h1>
        <ServicesV1 heading="Services" services={simpleServices} cta={servicesV1Cta} />
      </main>
      <Footer />
    </>
  );
}
