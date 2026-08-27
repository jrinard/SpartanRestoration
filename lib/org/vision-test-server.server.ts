import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const visionTestPort = 3001;
export const visionTestUrl = `http://localhost:${visionTestPort}`;

type VisionTestState = {
  pid: number;
  orgId: string;
  port: number;
};

function statePath(): string {
  return path.join(process.cwd(), "vision-out", ".test-server.json");
}

function packDir(orgId: string): string {
  return path.join(process.cwd(), "vision-out", orgId);
}

async function readState(): Promise<VisionTestState | null> {
  try {
    const raw = JSON.parse(await readFile(statePath(), "utf8")) as Partial<VisionTestState>;
    if (typeof raw.pid !== "number" || typeof raw.orgId !== "string") return null;
    return { pid: raw.pid, orgId: raw.orgId, port: raw.port ?? visionTestPort };
  } catch {
    return null;
  }
}

async function writeState(state: VisionTestState): Promise<void> {
  await writeFile(statePath(), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function clearState(): Promise<void> {
  try {
    await unlink(statePath());
  } catch {
    // missing is fine
  }
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function pidsOnPort(port: number): Promise<number[]> {
  try {
    const { stdout } = await execFileAsync("lsof", ["-nP", "-iTCP:" + String(port), "-sTCP:LISTEN", "-t"]);
    return stdout
      .split(/\s+/)
      .map((value) => Number(value))
      .filter((pid) => Number.isInteger(pid) && pid > 0);
  } catch {
    return [];
  }
}

async function killPids(pids: number[]): Promise<void> {
  const unique = [...new Set(pids)];
  for (const pid of unique) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // already gone
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 400));
  for (const pid of unique) {
    if (!isPidAlive(pid)) continue;
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // already gone
    }
  }
}

async function waitForUrl(url: string, timeoutMs: number): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status > 0) return true;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}

export async function getVisionTestStatus(): Promise<{
  running: boolean;
  url: string;
  port: number;
  orgId: string | null;
}> {
  const state = await readState();
  const listeners = await pidsOnPort(visionTestPort);
  const running = listeners.length > 0;
  if (!running && state) {
    await clearState();
  }
  return {
    running,
    url: visionTestUrl,
    port: visionTestPort,
    orgId: running ? (state?.orgId ?? null) : null,
  };
}

export async function stopVisionTestServer(): Promise<void> {
  const state = await readState();
  const listeners = await pidsOnPort(visionTestPort);
  const extra = state && isPidAlive(state.pid) ? [state.pid] : [];
  await killPids([...listeners, ...extra]);
  await clearState();
}

export async function startVisionTestServer(orgId: string): Promise<{ url: string; orgId: string }> {
  const dir = packDir(orgId);
  if (!existsSync(path.join(dir, "package.json"))) {
    throw new Error(`No pack at vision-out/${orgId}. Pack Vision first.`);
  }

  const current = await getVisionTestStatus();
  if (current.running && current.orgId === orgId) {
    await openVisionTestWindow();
    return { url: visionTestUrl, orgId };
  }
  if (current.running && current.orgId) {
    await stopVisionTestServer();
  } else if (current.running) {
    throw new Error(
      "Port 3001 is already in use. Stop that process, then click Start/Stop again.",
    );
  }

  if (!existsSync(path.join(dir, "node_modules", "next"))) {
    await execFileAsync("npm", ["install"], {
      cwd: dir,
      timeout: 180_000,
      maxBuffer: 10 * 1024 * 1024,
    });
  }

  const child = spawn("npm", ["run", "dev", "--", "-p", String(visionTestPort)], {
    cwd: dir,
    env: {
      ...process.env,
      LIFESPRING_VISION: "1",
      PORT: String(visionTestPort),
    },
    detached: true,
    stdio: "ignore",
  });
  if (child.pid == null) {
    throw new Error("Failed to start the Vision test server.");
  }
  child.unref();
  await writeState({ pid: child.pid, orgId, port: visionTestPort });

  const ready = await waitForUrl(visionTestUrl, 60_000);
  if (!ready) {
    await stopVisionTestServer();
    throw new Error("Vision test server did not come up on :3001.");
  }

  await openVisionTestWindow();
  return { url: visionTestUrl, orgId };
}

async function openVisionTestWindow(): Promise<void> {
  if (process.platform !== "darwin") return;
  try {
    await execFileAsync("open", [visionTestUrl]);
  } catch {
    // opening the browser is optional
  }
}
