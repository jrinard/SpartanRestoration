import type { OrgPolicyKind, OrgPoliciesFile } from "@/lib/org/policies";
import type { OrgSeoFile, OrgSeoRoute } from "@/lib/org/types";

export function setSeoRouteNoIndex(
  seo: OrgSeoFile,
  routeKey: string,
  noIndex: boolean,
  seed?: Partial<OrgSeoRoute>,
): OrgSeoFile {
  const existing = seo.routes[routeKey];
  const base: OrgSeoRoute = existing ?? {
    title: seed?.title?.trim() || routeKey,
    description: seed?.description?.trim() || "",
    path: seed?.path ?? (routeKey === "home" ? "/" : `/${routeKey}`),
    ...seed,
  };

  const nextRoute: OrgSeoRoute = { ...base };
  if (noIndex) {
    nextRoute.noIndex = true;
  } else {
    delete nextRoute.noIndex;
  }

  return {
    ...seo,
    routes: {
      ...seo.routes,
      [routeKey]: nextRoute,
    },
  };
}

export function setPolicyNoIndex(
  policies: OrgPoliciesFile,
  kind: OrgPolicyKind,
  noIndex: boolean,
): OrgPoliciesFile {
  return {
    ...policies,
    [kind]: {
      ...policies[kind],
      noIndex,
    },
  };
}
