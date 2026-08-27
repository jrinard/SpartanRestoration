"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useContactNavigation } from "@/lib/use-contact-navigation";

type CTAV2Props = {
  headline: string;
  subtext?: string;
  ctaLabel: string;
  ctaHref: string;
  eyebrow?: string;
};

/**
 * Asymmetric CTA — headline left, invitation card right, horizon glow.
 */
export function CTAV2({
  headline,
  subtext,
  ctaLabel,
  ctaHref,
  eyebrow = "Next step",
}: CTAV2Props) {
  const navigateContact = useContactNavigation();

  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-glow-from via-glow-via/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-accent-purple-deep/14 via-accent-purple-muted/6 to-transparent" />
        <div className="absolute -bottom-[45%] left-1/2 h-[70vh] w-[180vw] -translate-x-1/2 rounded-[50%] bg-accent-purple-deep/12 blur-[80px]" />
      </div>

      <Container className="relative">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="font-mono text-sm tracking-widest text-accent-purple uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headline}
            </h2>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-accent-purple/20 bg-background/60 p-8 backdrop-blur-sm sm:p-10">
              <div
                className="pointer-events-none absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent-purple/60 to-transparent"
                aria-hidden="true"
              />
              {subtext && (
                <p className="text-base leading-relaxed text-muted">{subtext}</p>
              )}
              <div className={subtext ? "mt-8" : ""}>
                <a
                  href={ctaHref}
                  className="block"
                  onClick={(event) => navigateContact(ctaHref, event)}
                >
                  <Button size="lg" className="w-full">
                    {ctaLabel}
                  </Button>
                </a>
              </div>
              {siteConfig.email && (
                <p className="mt-5 text-center text-sm text-muted">
                  Prefer email?{" "}
                  <Link
                    href={`mailto:${siteConfig.email}`}
                    className="text-foreground underline decoration-accent-purple/40 underline-offset-4 transition-colors hover:text-accent-purple"
                  >
                    {siteConfig.email}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
