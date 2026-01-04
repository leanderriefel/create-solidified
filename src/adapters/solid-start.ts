import type { FrameworkAdapter } from "../utils/types";
import { addSolidStartPlugin } from "../utils/solidstart";

export const solidStartAdapter: FrameworkAdapter = {
  name: "solid-start",
  configPath: "app.config.ts",
  cssEntryPath: "src/app.css",
  routesDir: "src/routes",
  entryPath: "src/app.tsx",
  devPort: 3000,
  devCommand: "npm run dev",
  envPrefix: "VITE_",

  async addPlugin(dir, plugin, call) {
    await addSolidStartPlugin(dir, plugin, call);
  },
};
