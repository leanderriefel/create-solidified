import type { ProjectConfig } from "./utils/types";
import { scaffoldProject } from "./utils/scaffold";

const testConfig: ProjectConfig = {
  name: "test-app",
  directory: "test-app",
  packageManager: "bun",
  framework: "vite-solid-router",
  style: "tailwind",
  database: "none",
  auth: "none",
  api: "none",
  testing: "vitest",
  linting: "biome",
  formatting: "biome",
  gitHooks: "none",
  deployment: "none",
};

console.log("Scaffolding test project...\n");
await scaffoldProject(testConfig);
