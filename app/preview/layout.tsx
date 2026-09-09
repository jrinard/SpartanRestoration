import type { Metadata } from "next";
import { previewOrgPageMetadata } from "@/lib/org/live-page.server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return previewOrgPageMetadata();
}

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
