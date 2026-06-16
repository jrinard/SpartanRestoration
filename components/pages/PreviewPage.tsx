import { SectionSwitcher } from "@/components/dev/SectionSwitcher";

export function PreviewPage() {
  return (
    <main id="main-content">
      <SectionSwitcher group="header" defaultVariant="header-v2" />
      <SectionSwitcher group="hero" defaultVariant="heroVideo-v1" />
      <SectionSwitcher group="featureTiles" />
      <SectionSwitcher group="testimonials" />
      <SectionSwitcher group="services" defaultVariant="servicesIcons-v1" />
      <SectionSwitcher group="cta" />
      <SectionSwitcher group="footer" defaultVariant="footer-v2" />
    </main>
  );
}
