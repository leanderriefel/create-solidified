import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PackageManager } from "./types";

const execFileAsync = promisify(execFile);

export function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npm install";
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn";
    case "bun":
      return "bun install";
  }
}

export function getRunCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npm run";
    case "pnpm":
      return "pnpm";
    case "yarn":
      return "yarn";
    case "bun":
      return "bun run";
  }
}

export function getExecCommand(pm: PackageManager): string {
  switch (pm) {
    case "npm":
      return "npm exec";
    case "pnpm":
      return "pnpm exec";
    case "yarn":
      return "yarn";
    case "bun":
      return "bunx";
  }
}

export async function getPackageManagerVersion(pm: PackageManager): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(pm, ["--version"], { windowsHide: true });
    const version = stdout.trim().split(/\s+/)[0];
    return version || null;
  } catch {
    return null;
  }
}
