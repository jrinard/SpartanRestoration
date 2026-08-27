export const clientOrgIdStorageKey = "ls.current-org-id";
export const orgOpenedEvent = "ls-org-opened";
export const defaultOrgId = "lsd";

const orgStoragePrefix = "ls.org.";

/** Unprefixed playground keys from the clone era. Open/hydrate must not read these. */
const legacyGlobalPlaygroundKeys = [
  "lifespring-playground-pages",
  "lifespring-playground-section-order",
  "lifespring-section-instances",
  "lifespring-content-instances",
  "lifespring-spacer-instances",
  "lifespring-creative-font-theme",
  "lifespring-creative-color-theme",
  "lifespring-playground-image-library-folder",
  "lifespring-playground-image-library-folder-override",
  "lifespring-playground-spacer-repair",
  "lifespring-favicon-preview",
  "lifespring-nav-bar-preview",
  "lifespring-services-icons-v2-preview",
  "lifespring-reviews-preview-v1",
  "lifespring-cta-v1-preview",
  "lifespring-portfolio-v2-preview",
  "lifespring-hero-v21-preview",
  "lifespring-hero-button-preview",
  "lifespring-hero-banner-preview",
  "lifespring-images-v1-preview",
  "lifespring-footer-v3-preview",
  "lifespring-portfolio-preview",
  "lifespring-service-area-v2-preview",
  "lifespring-service-area-v1-preview",
  "lifespring-top-bar-preview",
  "lifespring-header-v3-nav-gradient",
  "lifespring-reviewbox-preview-v2",
  "lifespring-reviewbox-preview",
  "lifespring-text-icons-v3-preview",
  "lifespring-hero-v1-preview",
  "lifespring-services-v1-preview",
  "lifespring-contact-preview-v1",
  "lifespring-text-image-preview",
  "lifespring-analytics-preview",
  "lifespring-footer-v1-preview",
  "lifespring-hero-v4-preview",
  "lifespring-text-images-preview",
  "lifespring-spacer-stripe-style",
  "lifespring-spacer-gradient-style",
];

export function getClientOrgId(): string {
  if (typeof window === "undefined") return defaultOrgId;
  try {
    return localStorage.getItem(clientOrgIdStorageKey) || defaultOrgId;
  } catch {
    return defaultOrgId;
  }
}

export function setClientOrgId(orgId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(clientOrgIdStorageKey, orgId);
}

export function orgStorageKey(name: string): string {
  return `${orgStoragePrefix}${getClientOrgId()}.${name}`;
}

export function orgStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(orgStorageKey(key));
  } catch {
    return null;
  }
}

export function orgStorageSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(orgStorageKey(key), value);
}

export function orgStorageRemove(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(orgStorageKey(key));
}

export function clearCurrentOrgStorage(): void {
  if (typeof window === "undefined") return;
  const prefix = `${orgStoragePrefix}${getClientOrgId()}.`;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

export function purgeLegacyGlobalPlaygroundKeys(): void {
  if (typeof window === "undefined") return;
  for (const key of legacyGlobalPlaygroundKeys) {
    localStorage.removeItem(key);
  }
}

export function notifyOrgOpened(orgId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(orgOpenedEvent, { detail: { orgId } }));
}
