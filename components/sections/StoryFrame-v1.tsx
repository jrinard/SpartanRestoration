import { Container } from "@/components/ui/Container";

type StoryPanel = {
  setup: string;
  punchline: string;
  imageAlt?: string;
};

type StoryFrameV1Props = {
  panels: StoryPanel[];
  closingHeading?: string;
  closingBody?: string;
};

/**
 * Dual-panel story section with setup line + punchline pairs.
 */
export function StoryFrameV1({ panels, closingHeading, closingBody }: StoryFrameV1Props) {
  return (
    <section className="py-24">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2">
          {panels.map((panel) => (
            <div key={panel.setup} className="flex flex-col gap-6">
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-surface/50">
                <span className="text-xs tracking-widest text-muted/50 uppercase">
                  {panel.imageAlt ?? "Image"}
                </span>
              </div>
              <div>
                <p className="text-sm tracking-wide text-muted uppercase">{panel.setup}</p>
                <p className="mt-2 font-serif text-3xl font-light text-foreground sm:text-4xl">
                  {panel.punchline}
                </p>
              </div>
            </div>
          ))}
        </div>
        {(closingHeading || closingBody) && (
          <div className="mx-auto mt-20 max-w-3xl text-center">
            {closingHeading && (
              <h3 className="font-serif text-2xl font-light text-foreground sm:text-3xl">
                {closingHeading}
              </h3>
            )}
            {closingBody && (
              <p className="mt-4 text-lg leading-relaxed text-muted">{closingBody}</p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
