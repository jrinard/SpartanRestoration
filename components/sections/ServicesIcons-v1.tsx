import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type IconService = {
  title: string;
  description: string;
  icon: string;
};

type ServicesIconsV1Props = {
  heading?: string;
  subheading?: string;
  services: IconService[];
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Service grid with icons — inspired by icon-driven service overview sections.
 */
export function ServicesIconsV1({
  heading = "Our Services",
  subheading,
  services,
  ctaLabel,
  ctaHref,
}: ServicesIconsV1Props) {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
            {heading}
          </h2>
          {subheading && <p className="mt-4 text-lg text-muted">{subheading}</p>}
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="flex flex-col items-center rounded-xl border border-border bg-surface/50 p-8 text-center transition-colors hover:border-accent-blue/30"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-3xl">
                <span role="img" aria-hidden="true">
                  {service.icon}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-medium text-foreground">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>
            </article>
          ))}
        </div>

        {ctaLabel && ctaHref && (
          <div className="mt-12 text-center">
            <a href={ctaHref}>
              <Button size="lg">{ctaLabel}</Button>
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}
