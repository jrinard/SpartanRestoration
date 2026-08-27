export type ParsedNavHref = {
  pathname: string;
  hash: string;
};

export function parseNavHref(href: string): ParsedNavHref {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) {
    return { pathname: href.trim(), hash: "" };
  }

  return {
    pathname: href.slice(0, hashIndex).trim(),
    hash: href.slice(hashIndex),
  };
}

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") return "/";
  return trimmed.replace(/\/$/, "") || "/";
}

export function navPathsMatch(a: string, b: string): boolean {
  return normalizePathname(a) === normalizePathname(b);
}

export function scrollToHashElement(
  hash: string,
  options?: ScrollIntoViewOptions,
): boolean {
  if (!hash.startsWith("#") || hash.length < 2) return false;

  const target = document.getElementById(hash.slice(1));
  if (!target) return false;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
    ...options,
  });
  return true;
}

export function scrollToHashHref(href: string): boolean {
  const { pathname, hash } = parseNavHref(href);
  if (!hash) return false;

  if (pathname && !navPathsMatch(pathname, window.location.pathname)) {
    return false;
  }

  if (!scrollToHashElement(hash)) return false;

  const nextUrl = `${window.location.pathname}${hash}`;
  window.history.replaceState(null, "", nextUrl);
  return true;
}

type RequestScrollToHashOptions = {
  behavior?: ScrollBehavior;
  maxAttempts?: number;
  intervalMs?: number;
};

let pendingScrollHash: string | null = null;

/** Queue a hash scroll for after route or playground page changes. */
export function setPendingScrollHash(hash: string): void {
  if (!hash.startsWith("#") || hash.length < 2) return;
  pendingScrollHash = hash;
}

export function clearPendingScrollHash(): void {
  pendingScrollHash = null;
}

/** Pending hash takes priority over the current URL hash. */
export function resolveScrollHash(): string {
  if (pendingScrollHash) return pendingScrollHash;
  return window.location.hash;
}

export function requestScrollToHash(
  hash: string,
  {
    behavior = "smooth",
    maxAttempts = 60,
    intervalMs = 100,
  }: RequestScrollToHashOptions = {},
): () => void {
  if (!hash.startsWith("#") || hash.length < 2) {
    return () => {};
  }

  const scroll = () =>
    scrollToHashElement(hash, {
      behavior,
      block: "start",
    });

  if (scroll()) {
    window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    clearPendingScrollHash();
    return () => {};
  }

  let attempts = 0;
  const timerId = window.setInterval(() => {
    attempts += 1;
    if (scroll()) {
      window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
      clearPendingScrollHash();
      window.clearInterval(timerId);
      return;
    }

    if (attempts >= maxAttempts) {
      window.clearInterval(timerId);
    }
  }, intervalMs);

  return () => window.clearInterval(timerId);
}
