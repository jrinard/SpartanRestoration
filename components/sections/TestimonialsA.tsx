import { Container } from "@/components/ui/Container";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

type TestimonialsAProps = {
  heading?: string;
  testimonials: Testimonial[];
};

export function TestimonialsA({
  heading = "What Our Clients Say",
  testimonials,
}: TestimonialsAProps) {
  return (
    <section className="py-24">
      <Container>
        <h2 className="text-center font-serif text-3xl font-light text-foreground sm:text-4xl">
          {heading}
        </h2>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-xl border border-border bg-surface/50 p-8"
            >
              <p className="text-sm leading-relaxed text-muted">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-6">
                <cite className="not-italic">
                  <span className="block text-sm font-medium text-foreground">
                    {t.name}
                  </span>
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
