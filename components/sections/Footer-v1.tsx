import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";

type FooterV1Props = {
  description?: string;
};

export function FooterV1({ description }: FooterV1Props) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg text-foreground">{siteConfig.name}</p>
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Navigation</p>
            <nav className="mt-4 flex flex-col gap-2">
              {siteConfig.nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Contact</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted">
              {siteConfig.email && (
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors hover:text-foreground"
                >
                  {siteConfig.email}
                </a>
              )}
              {siteConfig.phone && <span>{siteConfig.phone}</span>}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted">
          &copy; {year} {siteConfig.name}. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
