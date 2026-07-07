"use client";

import { useEffect, type ReactNode } from "react";
import { setPreferPlaygroundPreviewSettings } from "@/lib/homepage-settings";
import { ContactModal } from "@/components/contact/ContactModal";
import { ContactModalProvider } from "@/components/contact/ContactModalContext";
import { CreativeBar } from "@/components/dev/CreativeBar";
import { CreativeProvider } from "@/components/dev/CreativeProvider";
import { ContactModalPreviewProvider } from "@/components/dev/ContactModalPreviewProvider";
import { HashScrollOnNavigate } from "@/components/dev/HashScrollOnNavigate";
import { PlaygroundSectionsProvider } from "@/components/dev/PlaygroundSectionsProvider";

type PreviewShellProps = {
  children: ReactNode;
  showControls?: boolean;
};

/**
 * Wraps preview routes with theme context. Control panel is playground-only.
 */
export function PreviewShell({ children, showControls = false }: PreviewShellProps) {
  useEffect(() => {
    setPreferPlaygroundPreviewSettings(true);
    return () => setPreferPlaygroundPreviewSettings(false);
  }, []);

  return (
    <CreativeProvider>
      <ContactModalPreviewProvider enableContentEditing={showControls}>
        <ContactModalProvider>
          {showControls ? (
            <PlaygroundSectionsProvider>
              <CreativeBar />
              {children}
            </PlaygroundSectionsProvider>
          ) : (
            children
          )}
          <ContactModal />
          {!showControls && <HashScrollOnNavigate />}
        </ContactModalProvider>
      </ContactModalPreviewProvider>
    </CreativeProvider>
  );
}
