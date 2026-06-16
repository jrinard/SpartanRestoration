import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type HeroV2Props = {
  headline: string;
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageAlt?: string;
};

export function HeroV2({
  headline,
  subtext,
  ctaLabel,
  ctaHref,
  imageAlt = "Hero image",
}: HeroV2Props) {
  return (
    <section className="py-24 lg:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-6 text-lg text-muted">{subtext}</p>
          {ctaLabel && ctaHref && (
            <div className="mt-8">
              <a href={ctaHref}>
                <Button size="lg">{ctaLabel}</Button>
              </a>
            </div>
          )}
        </div>
        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-surface">
          <span className="text-sm text-muted">{imageAlt}</span>
        </div>
      </Container>
    </section>
  );
}
