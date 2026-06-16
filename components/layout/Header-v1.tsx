import Link from "next/link";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { Container } from "@/components/ui/Container";
import { Nav } from "@/components/layout/Nav";
import { cn } from "@/lib/utils";

type HeaderV1Props = {
  className?: string;
};

/** Classic header — logo left, navigation right. */
export function HeaderV1({ className }: HeaderV1Props) {
  return (
    <header className={cn("border-b border-border bg-background/80 backdrop-blur-sm", className)}>
      <Container as="div" className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center">
          <HeaderBrand priority />
        </Link>
        <Nav className="hidden md:flex" />
      </Container>
    </header>
  );
}
