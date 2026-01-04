import type { Framework, FrameworkAdapter } from "../utils/types";
import { viteSolidRouterAdapter } from "./vite-solid-router";
import { solidStartAdapter } from "./solid-start";

function createPlaceholderAdapter(name: Framework): FrameworkAdapter {
  return {
    name,
    configPath: "",
    cssEntryPath: "",
    routesDir: "",
    entryPath: "",
    devPort: 3000,
    devCommand: "npm run dev",
    envPrefix: "PUBLIC_",
    addPlugin: async () => {
      throw new Error(`Framework "${name}" is not yet implemented`);
    },
  };
}

const adapters: Record<Framework, FrameworkAdapter> = {
  "vite-solid-router": viteSolidRouterAdapter,
  "solid-start": solidStartAdapter,
  "tanstack-start": createPlaceholderAdapter("tanstack-start"),
};

export function getAdapter(framework: Framework): FrameworkAdapter {
  const adapter = adapters[framework];
  if (!adapter.configPath) {
    throw new Error(`Framework "${framework}" is not yet implemented`);
  }
  return adapter;
}
