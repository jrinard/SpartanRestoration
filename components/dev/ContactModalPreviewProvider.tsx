"use client";

import type { ReactNode } from "react";
import { ContactV1PreviewProvider } from "@/components/dev/ContactV1PreviewContext";

/** Shared contact popup settings for playground and preview routes. */
export function ContactModalPreviewProvider({
  children,
  enableContentEditing = false,
}: {
  children: ReactNode;
  enableContentEditing?: boolean;
}) {
  return (
    <ContactV1PreviewProvider enableContentEditing={enableContentEditing} globalOnly>
      {children}
    </ContactV1PreviewProvider>
  );
}
