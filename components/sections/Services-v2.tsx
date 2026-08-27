import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type DetailedService = {
  title: string;
  description: string;
  bullets: string[];
};

type ServicesV2Props = {
  heading?: string;
  subheading?: string;
  services: DetailedService[];
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Detailed service blocks with bullet lists and feature points.
 */
export function ServicesV2({
  heading = "Our Services",
  subheading,
  services,
  ctaLabel,
  ctaHref,
}: ServicesV2Props) {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
            {heading}
          </h2>
          {subheading && <p className="mt-4 text-lg text-muted">{subheading}</p>}
        </div>

        <div className="mt-16 flex flex-col gap-16">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
            >
              <div
                className={`flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-surface/50 ${index % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <span className="text-xs tracking-widest text-muted/50 uppercase">
                  Service Image
                </span>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <h3 className="text-2xl font-medium text-foreground">{service.title}</h3>
                <p className="mt-3 text-muted">{service.description}</p>
                <ul className="mt-6 flex flex-col gap-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm text-muted">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        {ctaLabel && ctaHref && (
          <div className="mt-16 text-center">
            <a href={ctaHref}>
              <Button size="lg">{ctaLabel}</Button>
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}
