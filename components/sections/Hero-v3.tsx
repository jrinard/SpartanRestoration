import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type HeroV3Props = {
  lines: string[];
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Bold stacked headline hero — inspired by large agency landing heroes.
 */
export function HeroV3({ lines, subtext, ctaLabel, ctaHref }: HeroV3Props) {
  return (
    <section className="hero-v3 relative overflow-hidden py-24 lg:py-36">
      <div className="hero-v3-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative text-center">
        <h1 className="font-serif text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl">{subtext}</p>
        {ctaLabel && ctaHref && (
          <div className="mt-10">
            <a href={ctaHref}>
              <Button size="lg">{ctaLabel}</Button>
            </a>
          </div>
        )}
      </Container>
    </section>
  );
}
