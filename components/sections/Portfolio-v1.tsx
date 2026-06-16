import Link from "next/link";
import { Container } from "@/components/ui/Container";

type Project = {
  title: string;
  tags: string;
  href?: string;
};

type PortfolioV1Props = {
  heading?: string;
  projects: Project[];
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Featured work grid — inspired by agency portfolio strips.
 */
export function PortfolioV1({
  heading,
  projects,
  ctaLabel = "View All Projects",
  ctaHref = "/projects",
}: PortfolioV1Props) {
  return (
    <section className="py-24">
      <Container>
        {heading && (
          <h2 className="mb-12 font-serif text-3xl font-light text-foreground sm:text-4xl">
            {heading}
          </h2>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <article
              key={project.title}
              className="group overflow-hidden rounded-xl border border-border bg-surface/50 transition-colors hover:border-accent-blue/30"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-subtle-from to-subtle-to">
                <span className="text-xs tracking-widest text-muted/50 uppercase">
                  Project Image
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-medium text-foreground">{project.title}</h3>
                <p className="mt-1 text-sm text-muted">{project.tags}</p>
                {project.href && (
                  <Link
                    href={project.href}
                    className="mt-3 inline-block text-sm text-accent-blue transition-colors hover:text-accent-blue-dark"
                  >
                    View project →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        {ctaHref && (
          <div className="mt-12 text-center">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent-blue"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
