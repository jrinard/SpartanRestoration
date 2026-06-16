import { SectionSwitcher } from "@/components/dev/SectionSwitcher";

export function HomePage() {
  return (
    <main id="main-content">
      <SectionSwitcher group="header" defaultVariant="header-v3" />
      <SectionSwitcher group="hero" defaultVariant="heroWashing-v1" />
      <SectionSwitcher group="flipCards" />
      <SectionSwitcher group="services" defaultVariant="services-v3" />
      <SectionSwitcher group="portfolio" />
      <SectionSwitcher group="testimonials" defaultVariant="testimonials-v3" />
      <SectionSwitcher group="cta" />
      <SectionSwitcher group="footer" defaultVariant="footer-v4" />
    </main>
  );
}
