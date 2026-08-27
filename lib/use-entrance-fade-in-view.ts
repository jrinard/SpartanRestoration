"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

type UseEntranceFadeInViewOptions = {
  enabled: boolean;
  speedMs: number;
  /** Re-arm the observer when content identity changes (e.g. image src). */
  resetKey?: string;
};

type UseEntranceFadeInViewResult = {
  ref: RefObject<HTMLDivElement | null>;
  wrapStyle: CSSProperties | undefined;
};

/** Opacity fade that starts when the element scrolls into view (once). */
export function useEntranceFadeInView({
  enabled,
  speedMs,
  resetKey,
}: UseEntranceFadeInViewOptions): UseEntranceFadeInViewResult {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(() => !enabled);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    setVisible(false);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        observer.disconnect();

        if (prefersReducedMotion) {
          setVisible(true);
          return;
        }

        timer = window.setTimeout(() => setVisible(true), 100);
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [enabled, speedMs, resetKey]);

  const wrapStyle: CSSProperties | undefined = enabled
    ? {
        opacity: visible ? 1 : 0,
        transition: `opacity ${speedMs}ms ease-out`,
      }
    : undefined;

  return { ref, wrapStyle };
}
