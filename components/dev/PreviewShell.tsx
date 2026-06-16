"use client";

import type { ReactNode } from "react";
import { CreativeBar } from "@/components/dev/CreativeBar";
import { CreativeProvider } from "@/components/dev/CreativeProvider";

type PreviewShellProps = {
  children: ReactNode;
};

/**
 * Wraps preview routes with the internal creative toolbar and theme context.
 */
export function PreviewShell({ children }: PreviewShellProps) {
  return (
    <CreativeProvider>
      <CreativeBar />
      {children}
    </CreativeProvider>
  );
}
