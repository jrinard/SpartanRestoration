export type ServicesV1LayoutWidth = "contained" | "full";

export const defaultServicesV1LayoutWidth: ServicesV1LayoutWidth = "contained";

export const servicesV1LayoutWidths: { value: ServicesV1LayoutWidth; label: string }[] = [
  { value: "contained", label: "Contained" },
  { value: "full", label: "Full width" },
];

export function getServicesV1ContainerClassName(layoutWidth: ServicesV1LayoutWidth): string {
  if (layoutWidth === "full") {
    return "max-w-none px-10 lg:px-16 xl:px-20";
  }

  return "";
}

/** Card width matches the contained 3-column layout at max-w-6xl (~22rem). */
export function getServicesV1GridClassName(layoutWidth: ServicesV1LayoutWidth): string {
  if (layoutWidth === "full") {
    return "grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),22rem))] justify-start";
  }

  return "grid sm:grid-cols-2 lg:grid-cols-3";
}

export function getServicesV1CardClassName(layoutWidth: ServicesV1LayoutWidth): string {
  if (layoutWidth === "full") {
    return "max-w-[22rem]";
  }

  return "";
}
