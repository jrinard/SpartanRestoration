import Link from "next/link";
import { Container } from "@/components/ui/Container";

type NarrativeV1Props = {
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Long-form story block — inspired by narrative mid-page sections.
 */
export function NarrativeV1({ heading, body, ctaLabel, ctaHref }: NarrativeV1Props) {
  return (
    <section className="py-24">
      <Container className="max-w-3xl">
        <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">{heading}</h2>
        <p className="mt-6 text-lg leading-relaxed text-muted">{body}</p>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent-blue"
          >
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </Container>
    </section>
  );
}
