import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const variants = {
  primary:
    "radial-hover-shine bg-accent-blue text-white shadow-lg shadow-accent-blue/20",
  secondary:
    "border border-border bg-surface text-foreground hover:border-accent-blue/40 hover:bg-hover-overlay",
  ghost: "text-muted hover:text-foreground hover:bg-hover-overlay",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {variant === "primary" ? (
        <span className="relative z-[1]">{children}</span>
      ) : (
        children
      )}
    </button>
  );
}
