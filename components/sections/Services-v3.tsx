import Image from "next/image";
import { ServicesTicker } from "@/components/sections/ServicesTicker";
import { cn } from "@/lib/utils";

type WashingServiceSection = {
  id: string;
  title: string;
  paragraphs: string[];
  servicesLabel: string;
  services: string[];
  reverse?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageVariant?: "photo" | "commercial" | "organic";
};

type ServicesV3Props = {
  sections: WashingServiceSection[];
};

function AngledDivider() {
  return <div className="services-washing-divider" aria-hidden="true" />;
}

function SectionImage({
  section,
}: {
  section: WashingServiceSection;
}) {
  const thumbClass = cn(
    "content-image-thumbnail",
    section.imageVariant === "photo" && "content-image-pressure",
    section.imageVariant === "commercial" && "content-image-commercial content-image-placeholder",
    section.imageVariant === "organic" && "content-image-sealcoating content-image-placeholder",
  );

  if (section.imageVariant === "photo" && section.imageSrc) {
    return (
      <Image
        src={section.imageSrc}
        alt={section.imageAlt ?? ""}
        width={600}
        height={315}
        className={thumbClass}
      />
    );
  }

  if (section.imageSrc) {
    return (
      <div
        className={thumbClass}
        role="img"
        aria-label={section.imageAlt}
        style={{ backgroundImage: `url(${section.imageSrc})` }}
      />
    );
  }

  return <div className={cn(thumbClass, "content-image-placeholder")} aria-hidden="true" />;
}

/**
 * Stacked service write-ups with blue angled dividers and scrolling tickers — OSP-style.
 */
export function ServicesV3({ sections }: ServicesV3Props) {
  return (
    <div className="services-washing">
      {sections.map((section, index) => (
        <div key={section.id}>
          {index > 0 && <AngledDivider />}
          <section
            id={section.id}
            className={cn("content-section", section.reverse && "content-section-reverse")}
          >
            <div className="content-section-inner">
              <div className="content-text">
                <h2 className="content-header">{section.title}</h2>
                <SectionImage section={section} />
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                <p className="content-services-inline">
                  <strong>{section.servicesLabel}</strong>
                </p>
                <ServicesTicker items={section.services} ariaLabel={section.services.join(", ")} />
              </div>
            </div>
          </section>
        </div>
      ))}
      <AngledDivider />
    </div>
  );
}
