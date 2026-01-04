import { readProjectFile, writeProjectFile } from "./fs";

interface SolidStartPluginImport {
  name: string;
  from: string;
  default?: boolean;
}

/**
 * Add a plugin to app.config.ts for SolidStart
 * SolidStart uses a nested vite config within defineConfig
 */
export async function addSolidStartPlugin(
  dir: string,
  plugin: SolidStartPluginImport,
  pluginCall?: string,
): Promise<void> {
  let config = await readProjectFile(dir, "app.config.ts");

  // Add import statement
  const importStatement = plugin.default
    ? `import ${plugin.name} from "${plugin.from}";`
    : `import { ${plugin.name} } from "${plugin.from}";`;

  // Find last import and add after it
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
    config = importStatement + "\n" + config;
  }

  const call = pluginCall || `${plugin.name}()`;

  // Check if vite config with plugins already exists
  if (config.includes("vite:") && config.includes("plugins:")) {
    // Add to existing vite.plugins array
    config = config.replace(/plugins:\s*\[/, `plugins: [\n      ${call},`);
  } else if (config.includes("vite:")) {
    // vite exists but no plugins array
    config = config.replace(/vite:\s*\{/, `vite: {\n    plugins: [${call}],`);
  } else {
    // No vite config, add it after defineConfig({
    config = config.replace(
      /defineConfig\(\{/,
      `defineConfig({\n  vite: {\n    plugins: [${call}],\n  },`,
    );
  }

  await writeProjectFile(dir, "app.config.ts", config);
}

/**
 * Add or update the server preset in app.config.ts for SolidStart deployments
 */
export async function addSolidStartServerPreset(
  dir: string,
  preset: string,
  additionalConfig?: string,
): Promise<void> {
  let config = await readProjectFile(dir, "app.config.ts");

  // Build the server config object
  const serverConfigContent = additionalConfig
    ? `preset: "${preset}",\n${additionalConfig}`
    : `preset: "${preset}",`;

  // Check if server config exists
  if (config.includes("server:")) {
    // Update existing server config - replace the preset
    if (config.includes("preset:")) {
      config = config.replace(/preset:\s*["'][^"']*["']/, `preset: "${preset}"`);
    } else {
      // Add preset to existing server config
      config = config.replace(/server:\s*\{/, `server: {\n    ${serverConfigContent}`);
    }
  } else {
    // Add server config after defineConfig({
    config = config.replace(
      /defineConfig\(\{/,
      `defineConfig({\n  server: {\n    ${serverConfigContent}\n  },`,
    );
  }

  await writeProjectFile(dir, "app.config.ts", config);
}
