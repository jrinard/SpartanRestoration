import type { ServicesV1Cta } from "@/components/sections/Services-v1";
import { lsdServicesV1Cta } from "@/lib/demo-content";
import type { ServicesV1InstanceSettings } from "@/lib/section-instance-storage";

export function isStaleLsdServicesV1Cta(cta: ServicesV1Cta | undefined): boolean {
  return cta?.ctaLabel === "Let's Go" && cta?.ctaHref === "/contact";
}

export function resolveLsdServicesV1Cta(cta: ServicesV1Cta | undefined): ServicesV1Cta {
  if (!cta || isStaleLsdServicesV1Cta(cta)) {
    return { ...lsdServicesV1Cta };
  }
  return cta;
}

export function normalizeLsdServicesV1Instance(
  settings: ServicesV1InstanceSettings | undefined,
): ServicesV1InstanceSettings | undefined {
  if (!settings?.cta || !isStaleLsdServicesV1Cta(settings.cta)) return settings;
  return {
    ...settings,
    cta: resolveLsdServicesV1Cta(settings.cta),
  };
}
