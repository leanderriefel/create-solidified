import type { ProjectConfig } from "./types";
import { copyTemplate, readPackageJson, writePackageJson } from "./fs";
import { applyGenerators } from "../generators";
import { assertCompatibility } from "./compatibility";
import { getInstallCommand, getRunCommand, getPackageManagerVersion } from "./package-manager";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function initGitRepo(targetDir: string): Promise<void> {
  try {
    await execFileAsync("git", ["init"], { cwd: targetDir, windowsHide: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to initialize git repository. Ensure git is installed and on PATH. ${message}`,
    );
  }
}

/**
 * Scaffold a new project
 */
export async function scaffoldProject(config: ProjectConfig): Promise<void> {
  assertCompatibility(config);
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

  const pmVersion = await getPackageManagerVersion(config.packageManager);
  if (pmVersion) {
    const updatedPkg = await readPackageJson(targetDir);
    updatedPkg.packageManager = `${config.packageManager}@${pmVersion}`;
    await writePackageJson(targetDir, updatedPkg);
  }

  await initGitRepo(targetDir);

  console.log(`\nProject created at ${targetDir}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${config.directory}`);
  console.log(`  ${getInstallCommand(config.packageManager)}`);
  console.log(`  ${getRunCommand(config.packageManager)} dev`);
}
