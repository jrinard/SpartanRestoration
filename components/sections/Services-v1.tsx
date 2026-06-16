import { Container } from "@/components/ui/Container";

type Service = {
  title: string;
  description: string;
  icon?: string;
};

type ServicesV1Props = {
  heading?: string;
  subheading?: string;
  services: Service[];
};

export function ServicesV1({
  heading = "Our Services",
  subheading,
  services,
}: ServicesV1Props) {
  return (
    <section className="py-24">
      <Container>
        <div className="text-center">
          <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="mx-auto mt-4 max-w-2xl text-muted">{subheading}</p>
          )}
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-xl border border-border bg-surface/50 p-8 transition-colors hover:border-accent-blue/30"
            >
              {service.icon && (
                <span className="text-2xl" role="img" aria-hidden="true">
                  {service.icon}
                </span>
              )}
              <h3 className="mt-4 text-lg font-medium text-foreground">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
