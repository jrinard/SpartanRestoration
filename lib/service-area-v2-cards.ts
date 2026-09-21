import {
  serviceAreaV2Cards,
  type ServiceAreaV2Card,
} from "@/lib/service-area-v2-content";
import { spartanServiceAreaV2Cards } from "@/lib/spartan-service-area-v2-content";
import { stonepillarServiceAreaV2Cards } from "@/lib/stonepillar-service-area-v2-content";

export function getServiceAreaV2CardsForOrg(orgId: string): ServiceAreaV2Card[] {
  if (orgId === "spartan") return spartanServiceAreaV2Cards;
  if (orgId === "stonepillar") return stonepillarServiceAreaV2Cards;
  return serviceAreaV2Cards;
}

export function getServiceAreaV2CardBySlugForOrg(
  orgId: string,
  slug: string,
): ServiceAreaV2Card | undefined {
  const city = slug.replace(/^service-areas\//, "");
  return getServiceAreaV2CardsForOrg(orgId).find((card) => card.slug === city);
}
