import { cn } from "@/lib/utils";

type SectionLabelProps = {
  name: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps a section with a visible label — for preview/dev page identification.
 */
export function SectionLabel({ name, children, className }: SectionLabelProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="section-label pointer-events-none absolute top-4 left-6 z-20 font-mono text-sm tracking-widest text-accent-purple uppercase lg:left-8">
        {name}
      </span>
      {children}
    </div>
  );
}
