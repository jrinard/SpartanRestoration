import {
  serviceAreaV2Cards,
  type ServiceAreaV2Card,
} from "@/lib/service-area-v2-content";
import { spartanServiceAreaV2Cards } from "@/lib/spartan-service-area-v2-content";

export function getServiceAreaV2CardsForOrg(orgId: string): ServiceAreaV2Card[] {
  if (orgId === "spartan") return spartanServiceAreaV2Cards;
  return serviceAreaV2Cards;
}
