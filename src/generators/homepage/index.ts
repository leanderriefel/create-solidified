import type { Generator } from "../../utils/types";
import { writeProjectFile } from "../../utils/fs";
import { getAdapter } from "../../adapters";
import { buildSections, type HomepageSection } from "./sections";
import { buildProviders, wrapWithProviders } from "./providers";

export const homepageGenerator: Generator = {
  name: "homepage",
  async apply(dir, config) {
    const adapter = getAdapter(config.framework);

    // Build sections based on selected features
    const sections = buildSections(config);
    const providers = buildProviders(config);

    // Generate and write homepage
    const homepage = generateHomepage(sections);
    await writeProjectFile(dir, `${adapter.routesDir}/index.tsx`, homepage);

    // Wrap entry point with providers if needed
    if (providers.length > 0) {
      await wrapWithProviders(dir, adapter.entryPath, providers);
    }
  },
};

function generateHomepage(sections: HomepageSection[]): string {
  if (sections.length === 0) {
    // No visible features - show default welcome
    return `export default function Home() {
  return (
    <div class="welcome">
      <h1>Ready to build</h1>
      <p class="subtitle">Scaffolded with Create Solidified</p>
      <p class="hint">
        Edit <code>src/routes/index.tsx</code> to get started
      </p>
    </div>
  );
}
`;
  }

  const imports = mergeImports(sections.flatMap((s) => s.imports));

  // Collect inline components
  const inlineComponents = sections
    .filter((s) => s.inlineComponents)
    .map((s) => s.inlineComponents);

  // Collect card components
  const cards = sections.map((s) => s.component).join("\n\n");

  let output = "";
  if (imports.length > 0) {
    output += `${imports.join("\n")}\n`;
  }
  if (inlineComponents.length > 0) {
    if (output) output += "\n";
    output += `${inlineComponents.join("\n\n")}\n`;
  }

  return `${output}export default function Home() {
  return (
    <div class="features">
${cards}
    </div>
  );
}
`;
}

function mergeImports(imports: string[]): string[] {
  const merged = new Map<string, { order: number; defaultImport?: string; named: Set<string> }>();
  const passthrough: string[] = [];
  let order = 0;

  for (const line of imports) {
    const trimmed = line.trim();
    const defaultNamedMatch = trimmed.match(
      /^import\s+([A-Za-z_$][\w$]*)\s*,\s*{([^}]+)}\s+from\s+["']([^"']+)["'];?$/,
    );
    if (defaultNamedMatch) {
      const defaultImport = defaultNamedMatch[1];
      const names = defaultNamedMatch[2];
      const moduleName = defaultNamedMatch[3];
      if (!defaultImport || !names || !moduleName) {
        passthrough.push(line);
        continue;
      }
      const entry = merged.get(moduleName) ?? {
        order: order++,
        named: new Set<string>(),
      };
      if (entry.defaultImport && entry.defaultImport !== defaultImport) {
        passthrough.push(line);
        continue;
      }
      entry.defaultImport = entry.defaultImport ?? defaultImport;
      for (const name of names.split(",")) {
        const trimmedName = name.trim();
        if (trimmedName) entry.named.add(trimmedName);
      }
      merged.set(moduleName, entry);
      continue;
    }

    const namedMatch = trimmed.match(/^import\s+{([^}]+)}\s+from\s+["']([^"']+)["'];?$/);
    if (namedMatch) {
      const names = namedMatch[1];
      const moduleName = namedMatch[2];
      if (!names || !moduleName) {
        passthrough.push(line);
        continue;
      }
      const entry = merged.get(moduleName) ?? {
        order: order++,
        named: new Set<string>(),
      };
      for (const name of names.split(",")) {
        const trimmedName = name.trim();
        if (trimmedName) entry.named.add(trimmedName);
      }
      merged.set(moduleName, entry);
      continue;
    }

    const defaultMatch = trimmed.match(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["'];?$/);
    if (defaultMatch) {
      const defaultImport = defaultMatch[1];
      const moduleName = defaultMatch[2];
      if (!defaultImport || !moduleName) {
        passthrough.push(line);
        continue;
      }
      const entry = merged.get(moduleName) ?? {
        order: order++,
        named: new Set<string>(),
      };
      if (entry.defaultImport && entry.defaultImport !== defaultImport) {
        passthrough.push(line);
        continue;
      }
      entry.defaultImport = entry.defaultImport ?? defaultImport;
      merged.set(moduleName, entry);
      continue;
    }

    passthrough.push(line);
  }

  const mergedLines = Array.from(merged.entries())
    .sort((a, b) => a[1].order - b[1].order)
    .flatMap(([moduleName, entry]) => {
      const named = Array.from(entry.named).sort();
      if (!entry.defaultImport && named.length === 0) return [];
      if (entry.defaultImport && named.length > 0) {
        return [`import ${entry.defaultImport}, { ${named.join(", ")} } from "${moduleName}";`];
      }
      if (entry.defaultImport) {
        return [`import ${entry.defaultImport} from "${moduleName}";`];
      }
      return [`import { ${named.join(", ")} } from "${moduleName}";`];
    });

  return [...mergedLines, ...passthrough];
}
