export function scrollToHashHref(href: string): boolean {
  if (!href.startsWith("#") || href.length < 2) return false;

  const target = document.getElementById(href.slice(1));
  if (!target) return false;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", href);
  return true;
}
