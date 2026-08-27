import { Container } from "@/components/ui/Container";

type LogoBarV1Props = {
  heading?: string;
  logos: string[];
};

/**
 * Partner / client logo strip — inspired by trust bar sections.
 */
export function LogoBarV1({ heading = "Trusted By", logos }: LogoBarV1Props) {
  return (
    <section className="border-y border-border py-16">
      <Container>
        {heading && (
          <p className="mb-10 text-center text-sm tracking-widest text-muted uppercase">
            {heading}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((name) => (
            <div
              key={name}
              className="flex h-12 min-w-[120px] items-center justify-center rounded-lg border border-border/50 bg-surface/30 px-6"
            >
              <span className="text-sm font-medium text-muted/70">{name}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
