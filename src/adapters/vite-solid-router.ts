import type { FrameworkAdapter } from "../utils/types";
import { addVitePlugin } from "../utils/vite";

export const viteSolidRouterAdapter: FrameworkAdapter = {
  name: "vite-solid-router",
  configPath: "vite.config.ts",
  cssEntryPath: "src/app.css",
  routesDir: "src/routes",
  entryPath: "src/index.tsx",
  devPort: 5173,
  devCommand: "npm run dev",
  envPrefix: "VITE_",

  async addPlugin(dir, plugin, call) {
    await addVitePlugin(dir, plugin, call);
  },
};
