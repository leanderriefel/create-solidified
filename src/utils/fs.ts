import { existsSync, readdirSync } from "node:fs";
import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

export interface PackageJson {
  name?: string;
  version?: string;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
  [key: string]: unknown;
}

/**
 * Read and parse package.json from a directory
 */
export async function readPackageJson(dir: string): Promise<PackageJson> {
  const content = await readFile(join(dir, "package.json"), "utf-8");
  return JSON.parse(content);
}

/**
 * Write package.json to a directory
 */
export async function writePackageJson(dir: string, pkg: PackageJson): Promise<void> {
  await writeFile(join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
}

/**
 * Add dependencies to package.json
 */
export async function addDependencies(
  dir: string,
  deps: Record<string, string>,
  dev = false,
): Promise<void> {
  const pkg = await readPackageJson(dir);
  const key = dev ? "devDependencies" : "dependencies";
  pkg[key] = { ...(pkg[key] as Record<string, string>), ...deps };

  // Sort dependencies alphabetically
  pkg[key] = Object.fromEntries(
    Object.entries(pkg[key] as Record<string, string>).sort(([a], [b]) => a.localeCompare(b)),
  );

  await writePackageJson(dir, pkg);
}

/**
 * Add scripts to package.json
 */
export async function addScripts(dir: string, scripts: Record<string, string>): Promise<void> {
  const pkg = await readPackageJson(dir);
  pkg.scripts = { ...pkg.scripts, ...scripts };
  await writePackageJson(dir, pkg);
}

/**
 * Recursively copy a directory
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Copy a template directory to the target project
 */
export async function copyTemplate(templateName: string, targetDir: string): Promise<void> {
  const templateDir = join(import.meta.dirname, "../templates", templateName);
  await copyDir(templateDir, targetDir);
}

/**
 * Read a file from the project
 */
export async function readProjectFile(dir: string, filePath: string): Promise<string> {
  return readFile(join(dir, filePath), "utf-8");
}

/**
 * Write a file to the project
 */
export async function writeProjectFile(
  dir: string,
  filePath: string,
  content: string,
): Promise<void> {
  const fullPath = join(dir, filePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content);
}

/**
 * Check if a file exists in the project
 */
export function fileExists(dir: string, filePath: string): boolean {
  return existsSync(join(dir, filePath));
}

/**
 * Prepend content to a file
 */
export async function prependToFile(dir: string, filePath: string, content: string): Promise<void> {
  const existing = await readProjectFile(dir, filePath);
  await writeProjectFile(dir, filePath, content + "\n" + existing);
}

/**
 * Append content to a file
 */
export async function appendToFile(dir: string, filePath: string, content: string): Promise<void> {
  const existing = await readProjectFile(dir, filePath);
  await writeProjectFile(dir, filePath, existing + "\n" + content);
}

/**
 * Add environment variable to .env file
 */
export async function addEnvVar(dir: string, key: string, value: string): Promise<void> {
  const envPath = join(dir, ".env");
  let content = "";

  if (existsSync(envPath)) {
    content = await readFile(envPath, "utf-8");
  }

  const line = `${key}=${value}\n`;

  if (content.includes(`${key}=`)) {
    content = content.replace(new RegExp(`^${key}=.*$`, "m"), line.trim());
  } else {
    content += content && !content.endsWith("\n") ? "\n" : "";
    content += line;
  }

  await writeFile(envPath, content);
}
