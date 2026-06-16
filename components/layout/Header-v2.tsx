import Link from "next/link";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { Container } from "@/components/ui/Container";
import { Nav, splitNavItems } from "@/components/layout/Nav";
import { cn } from "@/lib/utils";

type HeaderV2Props = {
  className?: string;
};

/** Centered logo — navigation split on left and right. */
export function HeaderV2({ className }: HeaderV2Props) {
  const { left, right } = splitNavItems();

  return (
    <header className={cn("border-b border-border bg-background/80 backdrop-blur-sm", className)}>
      <Container as="div" className="grid h-24 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Nav items={left} className="hidden justify-start md:flex" />
        <Link href="/" className="flex justify-center">
          <HeaderBrand priority className="h-16" width={240} height={82} />
        </Link>
        <Nav items={right} className="hidden justify-end md:flex" />
      </Container>
    </header>
  );
}
