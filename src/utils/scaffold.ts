import type { ProjectConfig, PackageManager } from "./types";
import { copyTemplate, readPackageJson, writePackageJson } from "./fs";
import { applyGenerators } from "../generators";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

/**
 * Get the install command for a package manager
 */
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

/**
 * Get the run command for a package manager
 */
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

/**
 * Scaffold a new project
 */
export async function scaffoldProject(config: ProjectConfig): Promise<void> {
  const targetDir = join(process.cwd(), config.directory);

  // 1. Create project directory
  await mkdir(targetDir, { recursive: true });

  // 2. Copy base template
  await copyTemplate(config.framework, targetDir);

  // 3. Update package.json with project name
  const pkg = await readPackageJson(targetDir);
  pkg.name = config.name;
  await writePackageJson(targetDir, pkg);

  // 4. Apply all feature generators
  await applyGenerators(targetDir, config);

  console.log(`\nProject created at ${targetDir}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${config.directory}`);
  console.log(`  ${getInstallCommand(config.packageManager)}`);
  console.log(`  ${getRunCommand(config.packageManager)} dev`);
}
