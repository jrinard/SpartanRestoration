"use client";

import { useRef } from "react";
import { Container } from "@/components/ui/Container";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

type TestimonialsV2Props = {
  heading?: string;
  testimonials: Testimonial[];
};

/**
 * Horizontal testimonial scroller — inspired by agency carousel sections.
 */
export function TestimonialsV2({
  heading = "Testimonials",
  testimonials,
}: TestimonialsV2Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -el.clientWidth * 0.8 : el.clientWidth * 0.8;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section className="py-24">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-light text-foreground sm:text-4xl">
            {heading}
          </h2>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-blue/40 hover:text-foreground"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent-blue/40 hover:text-foreground"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((t) => (
            <blockquote
              key={`${t.name}-${t.role}`}
              className="w-[85vw] shrink-0 snap-start rounded-xl border border-border bg-surface/50 p-8 sm:w-[420px]"
            >
              <p className="text-sm leading-relaxed text-muted">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6">
                <cite className="not-italic">
                  <span className="block text-sm font-medium text-foreground">{t.name}</span>
                  <span className="text-xs text-muted">{t.role}</span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
