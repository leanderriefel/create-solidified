import type { ProjectConfig } from "../../utils/types";
import { readProjectFile, writeProjectFile } from "../../utils/fs";

export interface ProviderConfig {
  import: string;
  wrapper: string;
  closing: string;
  priority: number; // Lower = outer wrapper
}

export function buildProviders(config: ProjectConfig): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  // TRPC needs QueryProvider
  if (config.api === "trpc") {
    providers.push({
      import: 'import { QueryProvider } from "./lib/trpc/QueryProvider";',
      wrapper: "<QueryProvider>",
      closing: "</QueryProvider>",
      priority: 10,
    });
  }

  // Clerk needs ClerkProvider (using our wrapper)
  if (config.auth === "clerk") {
    providers.push({
      import: 'import { ClerkWrapper } from "./lib/clerk";',
      wrapper: "<ClerkWrapper>",
      closing: "</ClerkWrapper>",
      priority: 5,
    });
  }

  return providers.sort((a, b) => a.priority - b.priority);
}

export async function wrapWithProviders(
  dir: string,
  entryPath: string,
  providers: ProviderConfig[],
): Promise<void> {
  let content = await readProjectFile(dir, entryPath);

  // Add imports after existing imports
  for (const provider of providers) {
    // Check if import already exists
    if (!content.includes(provider.import)) {
      // Find the last import statement and add after it
      const importRegex = /^import .+ from .+;?\s*$/gm;
      let lastImportMatch: RegExpExecArray | null = null;
      let match: RegExpExecArray | null;

      while ((match = importRegex.exec(content)) !== null) {
        lastImportMatch = match;
      }

      if (lastImportMatch) {
        const insertPos = lastImportMatch.index + lastImportMatch[0].length;
        content = content.slice(0, insertPos) + "\n" + provider.import + content.slice(insertPos);
      }
    }
  }

  const hasWrapper = providers.some((provider) => content.includes(provider.wrapper));
  if (!hasWrapper) {
    const routerRegex = /(^|\n)([ \t]*)<Router\b/;
    const routerMatch = content.match(routerRegex);

    if (routerMatch) {
      const indent = routerMatch[2] ?? "";
      const openingLines = providers.map((provider) => `${indent}${provider.wrapper}`).join("\n");
      const closingLines = [...providers]
        .reverse()
        .map((provider) => `${indent}${provider.closing}`)
        .join("\n");

      content = content.replace(routerRegex, `$1${openingLines}\n${indent}<Router`);
      content = content.replace(/(<\/Router>)/, `$1\n${closingLines}`);
    }
  }

  await writeProjectFile(dir, entryPath, content);
}
