import { cn } from "@/lib/utils";

type PolicyDocumentContentProps = {
  title: string;
  body: string;
  className?: string;
};

/** Plain-text legal page: title plus blank-line paragraphs. */
export function PolicyDocumentContent({ title, body, className }: PolicyDocumentContentProps) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className={cn("legal-document", className)}>
      <header className="mb-8 border-b border-border/60 pb-6">
        <h1 className="font-serif text-3xl font-light text-foreground sm:text-4xl">{title}</h1>
      </header>
      <div className="space-y-4 text-sm leading-relaxed text-muted">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="whitespace-pre-wrap">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
