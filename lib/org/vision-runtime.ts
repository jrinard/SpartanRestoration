import { existsSync } from "node:fs";
import path from "node:path";

/** Packed Vision app (or local no-workshop run). No playground. */
export function isVisionRuntime(): boolean {
  if (process.env.LIFESPRING_VISION === "1" || process.env.LIFESPRING_VISION === "true") {
    return true;
  }
  // Send dest may not have .env.local; packed trees keep the org in site/.
  return existsSync(path.join(process.cwd(), "site", "org.json"));
}
