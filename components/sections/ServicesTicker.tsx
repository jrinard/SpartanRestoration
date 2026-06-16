"use client";

import { useEffect, useRef } from "react";

type ServicesTickerProps = {
  items: string[];
  ariaLabel: string;
};

/**
 * Horizontally scrolling services list — matches OSP marquee behavior.
 */
export function ServicesTicker({ items, ariaLabel }: ServicesTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duplicate = track.querySelector('.services-ticker-content[aria-hidden="true"]') as HTMLElement | null;

    if (reduceMotion) {
      if (duplicate) duplicate.style.display = "none";
      return;
    }

    let paused = false;
    let startTime: number | null = null;
    const duration = 45000;

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };

    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    const getLoopWidth = () => track.scrollWidth / 2;

    function animate(timestamp: number) {
      if (!track) return;
      if (!startTime) startTime = timestamp;

      if (!paused) {
        const loopWidth = getLoopWidth();
        if (loopWidth > 0) {
          const elapsed = timestamp - startTime;
          const progress = (elapsed % duration) / duration;
          track.style.transform = `translate3d(${-progress * loopWidth}px, 0, 0)`;
        }
      }

      frameId = requestAnimationFrame(animate);
    }

    let frameId = requestAnimationFrame(animate);

    const onResize = () => {
      startTime = performance.now();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [items]);

  const content = items.flatMap((item, index) => [
    <span
      key={`${item}-item`}
      className={index % 2 === 1 ? "services-ticker-item services-ticker-item-alt" : "services-ticker-item"}
    >
      {item}
    </span>,
    <span key={`${item}-sep`} className="services-ticker-sep" aria-hidden="true">
      &bull;
    </span>,
  ]);

  return (
    <div className="services-ticker" aria-label={ariaLabel}>
      <div className="services-ticker-track" ref={trackRef}>
        <span className="services-ticker-content">{content}</span>
        <span className="services-ticker-content" aria-hidden="true">
          {content}
        </span>
      </div>
    </div>
  );
}
