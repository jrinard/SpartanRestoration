"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ContactV1PreviewProvider } from "@/components/dev/ContactV1PreviewContext";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { usePreviewPathSlug } from "@/components/dev/usePlaygroundPageLink";
import { findPlaygroundContactSectionId } from "@/lib/playground-contact-section";
import {
  findPlaygroundPageBySlug,
  getActivePlaygroundPage,
  getPlaygroundPageSections,
  loadPlaygroundPagesState,
} from "@/lib/playground-pages";

/** Loads contact form settings from the playground contact section slot for the contact modal. */
export function ContactModalPreviewProvider({
  children,
  enableContentEditing = false,
}: {
  children: ReactNode;
  enableContentEditing?: boolean;
}) {
  const playground = useOptionalPlaygroundSections();
  const previewSlug = usePreviewPathSlug();
  const [instanceId, setInstanceId] = useState<string | undefined>();

  useEffect(() => {
    function resolveInstanceId(): string | undefined {
      if (playground?.ready) {
        return findPlaygroundContactSectionId(playground.sections);
      }

      const state = loadPlaygroundPagesState();
      const page =
        findPlaygroundPageBySlug(state.pages, previewSlug) ?? getActivePlaygroundPage(state);
      const sections = getPlaygroundPageSections(state, page.id);
      return findPlaygroundContactSectionId(sections);
    }

    setInstanceId(resolveInstanceId());

    const handler = () => setInstanceId(resolveInstanceId());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [playground?.ready, playground?.sections, previewSlug]);

  return (
    <ContactV1PreviewProvider instanceId={instanceId} enableContentEditing={enableContentEditing}>
      {children}
    </ContactV1PreviewProvider>
  );
}
