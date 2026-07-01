"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { usePortfolioPreview } from "@/components/dev/PortfolioPreviewContext";
import { Container } from "@/components/ui/Container";
import { defaultPortfolioPreviewSettings } from "@/lib/portfolio-preview";

type Project = {
  title: string;
  tags: string;
  description?: string;
  stack?: string;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type PortfolioTab = "web" | "branding";

type PortfolioV1Props = {
  heading?: string;
  projects: Project[];
  brandingProjects?: Project[];
  ctaLabel?: string;
  ctaHref?: string;
};

function PortfolioNavIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true">
      {direction === "left" ? (
        <path
          fill="currentColor"
          d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
        />
      ) : (
        <path
          fill="currentColor"
          d="m10 6-1.41 1.41L13.17 12l-4.58 4.59L10 18l6-6z"
        />
      )}
    </svg>
  );
}

/**
 * Featured work grid — inspired by agency portfolio strips.
 */
export function PortfolioV1({
  heading = "Projects",
  projects,
  brandingProjects = [],
  ctaLabel = "View All Projects",
  ctaHref,
}: PortfolioV1Props) {
  const preview = usePortfolioPreview();
  const theme = preview?.settings.theme ?? defaultPortfolioPreviewSettings.theme;
  const [activeTab, setActiveTab] = useState<PortfolioTab>("web");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const userInteractedRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const hasBranding = brandingProjects.length > 0;
  const activeProjects = activeTab === "branding" ? brandingProjects : projects;

  const resetCarousel = useCallback(() => {
    userInteractedRef.current = false;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    scrollRef.current?.classList.remove("is-auto-scrolling", "is-dragging");
  }, []);

  const switchTab = (tab: PortfolioTab) => {
    if (tab === activeTab) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setActiveTab(tab);
    resetCarousel();
  };

  useEffect(() => {
    resetCarousel();
  }, [activeTab, resetCarousel]);

  const stopAutoScroll = useCallback(() => {
    userInteractedRef.current = true;
    scrollRef.current?.classList.remove("is-auto-scrolling");
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    const track = scrollRef.current;
    if (!track) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const speed = 0.35;

    const tick = () => {
      if (userInteractedRef.current) return;

      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;

      track.classList.add("is-auto-scrolling");
      isAutoScrollingRef.current = true;

      if (track.scrollLeft >= maxScroll - 1) {
        track.scrollLeft = 0;
      } else {
        track.scrollLeft += speed;
      }

      isAutoScrollingRef.current = false;
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      track.classList.remove("is-auto-scrolling");
    };
  }, [activeProjects.length, activeTab]);

  const scrollProjects = (direction: "left" | "right") => {
    stopAutoScroll();

    const track = scrollRef.current;
    if (!track) return;

    const card = track.querySelector("article");
    const gap = 24;
    const amount = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.85;

    track.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    stopAutoScroll();

    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const track = scrollRef.current;
    if (!track) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
      moved: false,
    };
    track.setPointerCapture(event.pointerId);
    track.classList.add("is-dragging");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;

    const track = scrollRef.current;
    if (!track) return;

    const delta = event.clientX - dragState.current.startX;
    if (Math.abs(delta) > 4) dragState.current.moved = true;

    track.scrollLeft = dragState.current.scrollLeft - delta;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;

    dragState.current.active = false;
    scrollRef.current?.releasePointerCapture(event.pointerId);
    scrollRef.current?.classList.remove("is-dragging");
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.moved) return;

    event.preventDefault();
    event.stopPropagation();
    dragState.current.moved = false;
  };

  const handleUserScroll = () => {
    if (isAutoScrollingRef.current) return;
    stopAutoScroll();
  };

  return (
    <section
      id="portfolio"
      className="portfolio-v1 scroll-mt-24 py-[calc(6rem-15px)]"
      data-portfolio-theme={theme}
      aria-labelledby="portfolio-heading"
    >
      <Container className="max-w-[100rem] lg:px-10">
        <div className="portfolio-v1-layout">
          <div className="portfolio-v1-header-row">
            <div className="portfolio-v1-heading-wrap">
              <h2
                id="portfolio-heading"
                className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                {heading}
              </h2>
              {hasBranding && (
                <div className="portfolio-v1-tabs" role="tablist" aria-label="Project categories">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "web"}
                    className={activeTab === "web" ? "portfolio-v1-tab is-active" : "portfolio-v1-tab"}
                    onClick={() => switchTab("web")}
                  >
                    Web
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "branding"}
                    className={
                      activeTab === "branding" ? "portfolio-v1-tab is-active" : "portfolio-v1-tab"
                    }
                    onClick={() => switchTab("branding")}
                  >
                    Branding
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="portfolio-v1-carousel mt-12 flex items-center">
          <button
            type="button"
            className="portfolio-v1-nav shrink-0"
            aria-label="Scroll projects left"
            onClick={() => scrollProjects("left")}
          >
            <PortfolioNavIcon direction="left" />
          </button>

          <div
            ref={scrollRef}
            className="portfolio-v1-scroll min-w-0 flex-1 flex overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
            data-portfolio-tab={activeTab}
            tabIndex={0}
            role="region"
            aria-label={activeTab === "web" ? "Web design and development projects" : "Branding and graphic design projects"}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={handleClickCapture}
            onWheel={stopAutoScroll}
            onTouchStart={stopAutoScroll}
            onScroll={handleUserScroll}
            onKeyDown={stopAutoScroll}
          >
            {activeProjects.map((project, index) => (
              <article
                key={`${activeTab}-${project.title}`}
                className={
                  activeTab === "branding"
                    ? "portfolio-v1-card portfolio-v1-card--branding group shrink-0 snap-start rounded-xl border-2 border-border bg-surface/50 transition-[border-color,box-shadow] hover:border-accent-blue/40"
                    : "portfolio-v1-card group shrink-0 snap-start rounded-xl border-2 border-border bg-surface/50 transition-[border-color,box-shadow] hover:border-accent-blue/40"
                }
              >
                <div
                  className={
                    activeTab === "branding"
                      ? "portfolio-v1-card-media portfolio-v1-card-media--branding relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-subtle-from to-subtle-to"
                      : "portfolio-v1-card-media relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gradient-to-br from-subtle-from to-subtle-to"
                  }
                >
                  {project.imageSrc ? (
                    <Image
                      src={project.imageSrc}
                      alt={project.imageAlt ?? project.title}
                      fill
                      loading={index < 2 ? "eager" : "lazy"}
                      className={
                        activeTab === "branding"
                          ? "object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                          : "object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                      }
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 42vw, 28vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs tracking-widest text-muted/50 uppercase">
                        Project Image
                      </span>
                    </div>
                  )}
                </div>
                {activeTab !== "branding" && (
                  <div className="p-5">
                    <h3 className="font-serif text-xl font-bold uppercase tracking-wide text-foreground">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{project.tags}</p>
                    {project.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted/90 sm:text-sm">
                        {project.description}
                      </p>
                    )}
                    {project.stack && (
                      <p className="mt-2 text-xs leading-relaxed text-muted/90 sm:text-sm">
                        {project.stack}
                      </p>
                    )}
                    {project.href && (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} project (opens in new tab)`}
                        className="mt-3 inline-block text-sm text-accent-blue transition-colors hover:text-accent-blue-dark"
                      >
                        View project →
                      </a>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>

          <button
            type="button"
            className="portfolio-v1-nav shrink-0"
            aria-label="Scroll projects right"
            onClick={() => scrollProjects("right")}
          >
            <PortfolioNavIcon direction="right" />
          </button>
        </div>
        </div>
        {ctaHref && (
          <div className="mt-12 text-center">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent-blue"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
