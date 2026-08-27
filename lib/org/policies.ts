export type OrgPolicyKind = "privacy" | "terms";

export type OrgPolicyDocument = {
  enabled: boolean;
  title: string;
  noIndex: boolean;
  body: string;
};

export type OrgPoliciesFile = {
  schemaVersion: number;
  privacy: OrgPolicyDocument;
  terms: OrgPolicyDocument;
};

export const defaultOrgPolicyDocuments: Record<OrgPolicyKind, OrgPolicyDocument> = {
  privacy: {
    enabled: false,
    title: "Privacy Policy",
    noIndex: true,
    body: "",
  },
  terms: {
    enabled: false,
    title: "Terms & Conditions",
    noIndex: true,
    body: "",
  },
};

export const defaultOrgPolicies = (): OrgPoliciesFile => ({
  schemaVersion: 1,
  privacy: { ...defaultOrgPolicyDocuments.privacy },
  terms: { ...defaultOrgPolicyDocuments.terms },
});

function normalizePolicyDocument(
  value: Partial<OrgPolicyDocument> | null | undefined,
  fallback: OrgPolicyDocument,
): OrgPolicyDocument {
  if (!value || typeof value !== "object") {
    return { ...fallback };
  }

  return {
    enabled: value.enabled === true,
    title: typeof value.title === "string" && value.title.trim() ? value.title.trim() : fallback.title,
    noIndex: value.noIndex !== false,
    body: typeof value.body === "string" ? value.body : "",
  };
}

export function normalizeOrgPolicies(
  value: Partial<OrgPoliciesFile> | null | undefined,
): OrgPoliciesFile {
  const defaults = defaultOrgPolicies();
  if (!value || typeof value !== "object") return defaults;

  return {
    schemaVersion: 1,
    privacy: normalizePolicyDocument(value.privacy, defaults.privacy),
    terms: normalizePolicyDocument(value.terms, defaults.terms),
  };
}

/** A policy ships on the live site only when it is on and has copy. */
export function isOrgPolicyPublished(policy: OrgPolicyDocument | null | undefined): boolean {
  return Boolean(policy?.enabled && policy.body.trim());
}

export function getPublishedOrgPolicy(
  policies: OrgPoliciesFile,
  kind: OrgPolicyKind,
): OrgPolicyDocument | null {
  const policy = policies[kind];
  return isOrgPolicyPublished(policy) ? policy : null;
}
