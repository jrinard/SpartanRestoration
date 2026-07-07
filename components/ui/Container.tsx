import { cn } from "@/lib/utils";
import { getSiteContainedLayoutClassName } from "@/lib/site-layout";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer";
};

export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={cn(getSiteContainedLayoutClassName(), className)}>
      {children}
    </Tag>
  );
}
