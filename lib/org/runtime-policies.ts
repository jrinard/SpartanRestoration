import {
  defaultOrgPolicies,
  type OrgPoliciesFile,
} from "@/lib/org/policies";

let runtimeOverride: OrgPoliciesFile | null = null;

export function setRuntimePolicies(policies: OrgPoliciesFile | null): void {
  runtimeOverride = policies;
}

export function getRuntimePolicies(): OrgPoliciesFile {
  return runtimeOverride ?? defaultOrgPolicies();
}
