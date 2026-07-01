"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useContactNavigation } from "@/lib/use-contact-navigation";

type CTAV1Props = {
  headline: string;
  subtext?: string;
  ctaLabel: string;
  ctaHref: string;
};

export function CTAV1({ headline, subtext, ctaLabel, ctaHref }: CTAV1Props) {
  const navigateContact = useContactNavigation();

  return (
    <section className="py-24">
      <Container>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-accent-blue/10 to-accent-green/10 px-8 py-16 text-center sm:px-16">
          <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
            {headline}
          </h2>
          {subtext && (
            <p className="mx-auto mt-4 max-w-xl text-muted">{subtext}</p>
          )}
          <div className="mt-8">
            <a href={ctaHref} onClick={(event) => navigateContact(ctaHref, event)}>
              <Button size="lg">{ctaLabel}</Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
