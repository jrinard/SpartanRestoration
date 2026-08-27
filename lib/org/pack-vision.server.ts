import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { stopVisionTestServer } from "@/lib/org/vision-test-server.server";

const execFileAsync = promisify(execFile);

export async function packVisionForOrg(orgId: string): Promise<{ outDir: string; log: string }> {
  await stopVisionTestServer();
  const script = path.join(process.cwd(), "scripts", "pack-vision.mjs");
  const { stdout, stderr } = await execFileAsync(process.execPath, [script, orgId], {
    cwd: process.cwd(),
    timeout: 120_000,
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    outDir: path.join("vision-out", orgId),
    log: `${stdout}\n${stderr}`.trim(),
  };
}
