/** Workshop route. Old `/playground` bookmarks redirect here. */
export const forgePath = "/forge";
export const forgeLabel = "Forge";
export const legacyPlaygroundPath = "/playground";

export function isForgePathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === forgePath || pathname === legacyPlaygroundPath;
}

export function isForgePrefix(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === forgePath ||
    pathname.startsWith(`${forgePath}/`) ||
    pathname === legacyPlaygroundPath ||
    pathname.startsWith(`${legacyPlaygroundPath}/`)
  );
}
