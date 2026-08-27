import Link from "next/link";
import { Container } from "@/components/ui/Container";

type FeatureTile = {
  title: string;
  subtext: string;
  href: string;
  imageAlt?: string;
};

type FeatureTilesV1Props = {
  tiles: FeatureTile[];
};

/**
 * Three-up feature tiles — image, title, subtext, link to deeper pages.
 */
export function FeatureTilesV1({ tiles }: FeatureTilesV1Props) {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid gap-8 md:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface/50 transition-colors hover:border-accent-blue/30"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-subtle-from to-subtle-to transition-colors group-hover:from-subtle-hover-from">
                <span className="text-xs tracking-widest text-muted/50 uppercase">
                  {tile.imageAlt ?? "Image"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-medium text-foreground">{tile.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{tile.subtext}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-blue transition-colors group-hover:text-accent-blue-dark">
                  Learn more
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
