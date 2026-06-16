import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FlipCard = {
  id: string;
  frontLabel: ReactNode;
  frontLines?: string[];
  title: string;
  variant: "dark" | "medium" | "light" | "accent";
  frontImage?: string;
  bullets?: string[];
  paragraph?: string;
};

type FlipCardsProps = {
  heading?: string;
  cards: FlipCard[];
  layout?: "three" | "four";
};

/**
 * Hover flip cards — OSP-style service boxes with optional 3- or 4-card layout.
 */
export function FlipCards({ heading = "SERVICES", cards, layout = "three" }: FlipCardsProps) {
  const isFour = layout === "four" || cards.length === 4;

  return (
    <>
      <section className="area-4">
        <h2 className="area-4-title">{heading}</h2>
        <div className={cn("area-4-boxes tri-box-section", isFour && "flip-cards-4")}>
          {cards.map((card) => (
            <div
              key={card.id}
              className={cn("flip-card", `flip-card-${card.variant}`)}
              tabIndex={0}
              role="group"
              aria-label={typeof card.frontLabel === "string" ? card.frontLabel : card.title}
            >
              <div className="flip-card-inner">
                <div
                  className="flip-card-front"
                  style={card.frontImage ? { backgroundImage: `url(${card.frontImage})` } : undefined}
                  {...(card.frontImage ? { role: "img" as const, "aria-label": card.title } : {})}
                >
                  <span>
                    {card.frontLines
                      ? card.frontLines.map((line, index) => (
                          <span key={line}>
                            {line}
                            {index < card.frontLines!.length - 1 && <br />}
                          </span>
                        ))
                      : card.frontLabel}
                  </span>
                </div>
                <div className="flip-card-back">
                  <h3>{card.title}</h3>
                  {card.paragraph ? (
                    <p>{card.paragraph}</p>
                  ) : (
                    <ul>
                      {card.bullets?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="torn-divider" aria-hidden="true" />
    </>
  );
}
