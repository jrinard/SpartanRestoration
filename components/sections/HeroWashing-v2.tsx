import Link from "next/link";
import { cn } from "@/lib/utils";

type HeroWashingV2Props = {
  headline: string;
  leadText: string;
  quoteLabel: string;
  quoteHref: string;
  phoneLabel: string;
  phoneHref: string;
  backgroundImage?: string;
  className?: string;
};

/**
 * Full-bleed hero with lead text and centered CTAs — flat bottom, no clip-path.
 */
export function HeroWashingV2({
  headline,
  leadText,
  quoteLabel,
  quoteHref,
  phoneLabel,
  phoneHref,
  backgroundImage = "/osp/pic-banner3.jpeg",
  className,
}: HeroWashingV2Props) {
  return (
    <section
      className={cn("hero-washing hero-washing-v2 relative overflow-hidden", className)}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="hero-washing-buttons">
        <h1 className="hero-washing-lead">{leadText || headline}</h1>
        <div className="hero-washing-button-row">
          <Link href={quoteHref} className="hero-washing-btn hero-washing-btn-primary">
            {quoteLabel}
          </Link>
          <a href={phoneHref} className="hero-washing-btn hero-washing-btn-phone" aria-label={`Call us at ${phoneLabel}`}>
            {phoneLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
