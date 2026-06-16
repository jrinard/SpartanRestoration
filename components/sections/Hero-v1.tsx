import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type HeroV1Props = {
  headline: string;
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function HeroV1({ headline, subtext, ctaLabel, ctaHref }: HeroV1Props) {
  return (
    <section className="py-24 lg:py-32">
      <Container className="text-center">
        <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{subtext}</p>
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
