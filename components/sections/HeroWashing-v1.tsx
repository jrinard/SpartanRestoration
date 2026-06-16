import Link from "next/link";
import { cn } from "@/lib/utils";

type HeroWashingV1Props = {
  headline: string;
  serviceAreas: string;
  quoteLabel: string;
  quoteHref: string;
  phoneLabel: string;
  phoneHref: string;
  backgroundImage?: string;
  className?: string;
};

/**
 * Full-bleed hero with centered CTAs and angled clip-path bottom — OSP-style.
 */
export function HeroWashingV1({
  headline,
  serviceAreas,
  quoteLabel,
  quoteHref,
  phoneLabel,
  phoneHref,
  backgroundImage = "/osp/pic-banner3.jpeg",
  className,
}: HeroWashingV1Props) {
  return (
    <section
      className={cn("hero-washing relative overflow-hidden", className)}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <h1 className="sr-only">{headline}</h1>
      <div className="hero-washing-buttons">
        <p className="hero-washing-tagline">{serviceAreas}</p>
        <div className="hero-washing-button-row">
          <Link href={quoteHref} className="hero-washing-btn hero-washing-btn-primary">
            {quoteLabel}
          </Link>
          <a href={phoneHref} className="hero-washing-btn hero-washing-btn-phone" aria-label={`Call us at ${phoneLabel}`}>
            {phoneLabel}
          </a>
        </div>
      </div>
      <div className="hero-washing-clip" aria-hidden="true" />
    </section>
  );
}
