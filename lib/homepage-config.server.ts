import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeHomepageConfig,
  type HomepageConfig,
} from "@/lib/homepage-config";

const configPath = () => path.join(process.cwd(), "lib", "homepage-config.json");

export async function readHomepageConfig(): Promise<HomepageConfig> {
  try {
    const raw = await readFile(configPath(), "utf8");
    return normalizeHomepageConfig(JSON.parse(raw));
  } catch {
    return normalizeHomepageConfig({});
  }
}
