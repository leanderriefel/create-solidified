import { readProjectFile, writeProjectFile } from "./fs";

interface VitePluginImport {
  name: string;
  from: string;
  default?: boolean;
}

/**
 * Add a plugin to vite.config.ts
 * This is a simple string-based approach - for more complex cases,
 * consider using AST manipulation with babel or ts-morph
 */
export async function addVitePlugin(
  dir: string,
  plugin: VitePluginImport,
  pluginCall?: string,
): Promise<void> {
  let config = await readProjectFile(dir, "vite.config.ts");

  // Add import statement after existing imports
  const importStatement = plugin.default
    ? `import ${plugin.name} from "${plugin.from}";`
    : `import { ${plugin.name} } from "${plugin.from}";`;

  // Find the last import statement and add after it
  const importRegex = /^import .+ from .+;?\s*$/gm;
  let lastImportMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(config)) !== null) {
    lastImportMatch = match;
  }

  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    config = config.slice(0, insertPos) + "\n" + importStatement + config.slice(insertPos);
  } else {
    // No imports found, add at the beginning
    config = importStatement + "\n" + config;
  }

  // Add plugin to plugins array
  const call = pluginCall || `${plugin.name}()`;

  // Find plugins array and add the plugin
  // Handles both `plugins: [` and `plugins: [\n`
  const pluginsRegex = /plugins:\s*\[/;
  config = config.replace(pluginsRegex, `plugins: [\n      ${call},`);

  await writeProjectFile(dir, "vite.config.ts", config);
}

/**
 * Add configuration options to vite.config.ts
 */
export async function addViteConfig(
  dir: string,
  configKey: string,
  configValue: string,
): Promise<void> {
  let config = await readProjectFile(dir, "vite.config.ts");

  // Find the end of plugins array and add config after it
  // This is a simplified approach
  const defineConfigRegex = /defineConfig\(\{/;
  config = config.replace(defineConfigRegex, `defineConfig({\n  ${configKey}: ${configValue},`);

  await writeProjectFile(dir, "vite.config.ts", config);
}
