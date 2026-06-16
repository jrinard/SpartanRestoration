import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type HeroVideoV1Props = {
  lines: string[];
  subtext: string;
  ctaLabel?: string;
  ctaHref?: string;
  videoSrc?: string;
  videoPoster?: string;
};

/**
 * Split hero — copy + CTA on the left, video on the right.
 */
export function HeroVideoV1({
  lines,
  subtext,
  ctaLabel = "Start a Conversation",
  ctaHref = "/contact",
  videoSrc,
  videoPoster,
}: HeroVideoV1Props) {
  return (
    <section className="py-16 lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col">
          <h1 className="font-serif text-4xl font-light leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">{subtext}</p>
          {ctaLabel && ctaHref && (
            <div className="mt-8">
              <a href={ctaHref}>
                <Button size="lg">{ctaLabel}</Button>
              </a>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-surface">
          {videoSrc ? (
            <video
              className="aspect-video w-full object-cover"
              controls
              playsInline
              poster={videoPoster}
            >
              <source src={videoSrc} />
            </video>
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center bg-gradient-to-br from-subtle-from to-subtle-to">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background/80">
                <span className="ml-1 text-2xl text-muted" aria-hidden="true">
                  ▶
                </span>
              </div>
              <p className="mt-4 text-xs tracking-widest text-muted/50 uppercase">
                Video Placeholder
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
