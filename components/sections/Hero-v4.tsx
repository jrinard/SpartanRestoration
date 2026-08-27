"use client";

import Link from "next/link";
import { PreviewAwareLink } from "@/components/site/PreviewAwareLink";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isContactHref } from "@/lib/contact-modal";
import {
  defaultContactPreviewSettings,
  getHeroV4FormSettings,
} from "@/lib/contact-preview";
import { scrollToHashHref } from "@/lib/scroll-to-hash";
import { HeroV4Form } from "@/components/sections/Hero-v4-form";
import type { HeroV4Breadcrumb, HeroV4FormLeadSourceId, HeroV4ServicePill } from "@/lib/hero-v4-preview";
import {
  defaultHeroV4Breadcrumbs,
  defaultHeroV4FormLeadSourceId,
  defaultHeroV4PreviewSettings,
  defaultHeroV4ServicePills,
  resolveHeroV4FormLeadSource,
} from "@/lib/hero-v4-preview";
import { buildBreadcrumbListSchema, buildHeroV4ServicePillsSchema } from "@/lib/seo-schema";
import { cn } from "@/lib/utils";

type HeroV4Props = {
  breadcrumbs?: HeroV4Breadcrumb[];
  eyebrow?: string;
  headline?: string;
  body?: string;
  bullets?: string[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  phoneLabel?: string;
  phoneHref?: string;
  formTitle?: string;
  formSubtext?: string;
  formTrustNotes?: string[];
  formLeadSource?: HeroV4FormLeadSourceId;
  showForm?: boolean;
  showPhoneCta?: boolean;
  showServicePills?: boolean;
  servicePills?: HeroV4ServicePill[];
  className?: string;
};

/**
 * Split service-area hero — editable copy on the left, optional lead form on the right.
 * Same vertical rhythm as Hero-v3.
 */
export function HeroV4({
  breadcrumbs = defaultHeroV4Breadcrumbs,
  eyebrow = defaultHeroV4PreviewSettings.eyebrow,
  headline = defaultHeroV4PreviewSettings.headline,
  body = defaultHeroV4PreviewSettings.body,
  bullets = defaultHeroV4PreviewSettings.bullets,
  primaryCtaLabel = defaultHeroV4PreviewSettings.primaryCtaLabel,
  primaryCtaHref = defaultHeroV4PreviewSettings.primaryCtaHref,
  phoneLabel = defaultHeroV4PreviewSettings.phoneLabel,
  phoneHref = defaultHeroV4PreviewSettings.phoneHref,
  formTitle = defaultHeroV4PreviewSettings.formTitle,
  formSubtext = defaultHeroV4PreviewSettings.formSubtext,
  formTrustNotes = defaultHeroV4PreviewSettings.formTrustNotes,
  formLeadSource = defaultHeroV4FormLeadSourceId,
  showForm = defaultHeroV4PreviewSettings.showForm,
  showPhoneCta = defaultHeroV4PreviewSettings.showPhoneCta,
  showServicePills = defaultHeroV4PreviewSettings.showServicePills,
  servicePills = defaultHeroV4ServicePills,
  className,
}: HeroV4Props) {
  const pathname = usePathname();
  const modal = useContactModal();
  const contactPreview = useContactV1Preview();
  const formSettings = useMemo(
    () =>
      getHeroV4FormSettings(
        contactPreview?.settings ?? defaultContactPreviewSettings,
        resolveHeroV4FormLeadSource(formLeadSource),
      ),
    [contactPreview?.settings, formLeadSource],
  );
  const showPrimaryCta = !showForm;
  const showPhone = showPhoneCta && Boolean(phoneLabel);
  const visibleServicePills = showServicePills ? servicePills : [];
  const showActions = showPrimaryCta || showPhone || visibleServicePills.length > 0;

  const pageJsonLd = useMemo(() => {
    const blocks: Record<string, unknown>[] = [];
    if (breadcrumbs.length > 0) {
      blocks.push(
        buildBreadcrumbListSchema(
          breadcrumbs.map((crumb) => ({
            name: crumb.label,
            path: crumb.href || pathname || "/",
          })),
        ),
      );
    }
    if (visibleServicePills.length > 0) {
      blocks.push(buildHeroV4ServicePillsSchema(visibleServicePills, pathname));
    }
    return blocks;
  }, [breadcrumbs, pathname, visibleServicePills]);

  return (
    <section className={cn("hero-v4 hero-v3 relative overflow-hidden py-11 lg:py-[3.75rem]", className)}>
      {pageJsonLd.length > 0 ? <JsonLd data={pageJsonLd} /> : null}
      <div className="hero-v3-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative">
        <div
          className={cn(
            "hero-v4-grid grid items-start gap-10",
            showForm
              ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,400px)] lg:gap-12"
              : "hero-v4-grid--copy-only max-w-4xl",
          )}
        >
          <div className="hero-v4-copy min-w-0">
            {breadcrumbs.length > 0 ? (
              <nav className="hero-v4-breadcrumbs mb-5 text-sm text-muted" aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-2">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-muted/60" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      {crumb.href ? (
                        <PreviewAwareLink href={crumb.href} className="transition-colors hover:text-foreground">
                          {crumb.label}
                        </PreviewAwareLink>
                      ) : (
                        <span className="text-foreground/90">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <p className="hero-v4-eyebrow text-sm font-medium uppercase tracking-[0.18em] text-accent-blue">
              {eyebrow}
            </p>

            <h1 className="hero-v4-headline mt-4 font-serif text-4xl font-light leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              {headline}
            </h1>

            <p className="hero-v4-body mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {body}
            </p>

            {bullets.length > 0 ? (
              <ul className="hero-v4-bullets mt-8 grid gap-3 sm:grid-cols-2">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm text-foreground sm:text-base">
                    <span className="hero-v4-bullet-icon mt-1 shrink-0" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {showActions ? (
              <div
                className={cn(
                  "hero-v4-actions mt-8 flex flex-col items-start gap-4",
                  !showPrimaryCta && "sm:w-auto",
                )}
              >
                {visibleServicePills.length > 0 ? (
                  <nav aria-label="LifeSpring Design services in Clark County, WA">
                    <p className="sr-only">
                      Services offered by LifeSpring Design for Clark County, Washington
                      businesses: custom web design, custom software, CRM systems, logo and
                      branding, online reputation growth, and website optimization.
                    </p>
                    <ul className="hero-v4-service-pills flex flex-wrap gap-2">
                      {visibleServicePills.map((pill) => (
                        <li key={pill.label}>
                          <Link
                            href={pill.href}
                            title={pill.title}
                            className="hero-v4-service-pill inline-flex rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent-blue/40 hover:bg-hover-overlay sm:text-sm"
                            onClick={(event) => {
                              if (scrollToHashHref(pill.href)) {
                                event.preventDefault();
                              }
                            }}
                          >
                            {pill.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ) : null}

                {showPrimaryCta ? (
                  <div className="hero-v4-cta-row flex flex-wrap items-center gap-4">
                    <a
                      href={primaryCtaHref}
                      aria-label={`${primaryCtaLabel} — contact LifeSpring Design`}
                      onClick={(event) => {
                        if (modal && isContactHref(primaryCtaHref)) {
                          event.preventDefault();
                          modal.openContact({ message: primaryCtaLabel });
                          return;
                        }
                        if (scrollToHashHref(primaryCtaHref)) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <Button size="lg">{primaryCtaLabel}</Button>
                    </a>
                    {showPhone ? (
                      <a
                        href={phoneHref}
                        className="hero-v4-phone inline-flex items-center rounded-lg px-6 py-3 text-base font-bold transition-colors"
                      >
                        {phoneLabel}
                      </a>
                    ) : null}
                  </div>
                ) : showPhone ? (
                  <a
                    href={phoneHref}
                    className="hero-v4-phone inline-flex items-center rounded-lg px-6 py-3 text-base font-bold transition-colors"
                  >
                    {phoneLabel}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {showForm ? (
            <HeroV4Form
              title={formTitle}
              subtext={formSubtext}
              trustNotes={formTrustNotes}
              settings={formSettings}
              className="lg:sticky lg:top-28"
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
