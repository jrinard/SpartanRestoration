import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function isCancel(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const stderr =
    error && typeof error === "object" && "stderr" in error
      ? String((error as { stderr?: unknown }).stderr ?? "")
      : "";
  return /user canceled|-128/i.test(`${message}\n${stderr}`);
}

export async function pickLocalFolder(): Promise<string | null> {
  if (process.platform !== "darwin") {
    throw new Error("Folder picker is only available on macOS. Paste the path instead.");
  }

  try {
    const { stdout } = await execFileAsync(
      "osascript",
      [
        "-e",
        'tell application "System Events" to activate',
        "-e",
        'POSIX path of (choose folder with prompt "Choose the customer git checkout")',
      ],
      { timeout: 300_000 },
    );
    const picked = stdout.trim().replace(/\/+$/, "");
    return picked || null;
  } catch (error) {
    if (isCancel(error)) return null;
    throw error;
  }
}
