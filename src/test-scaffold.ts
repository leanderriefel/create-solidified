import type { ProjectConfig } from "./utils/types";
import { scaffoldProject } from "./utils/scaffold";

const testConfig: ProjectConfig = {
  name: "test-app",
  directory: "test-app",
  packageManager: "bun",
  framework: "solid-start",
  style: "tailwind",
  database: "drizzle",
  auth: "none",
  api: "trpc",
  testing: "none",
  linting: "biome",
  formatting: "biome",
  gitHooks: "none",
  deployment: "none",
};

console.log("Scaffolding test project...\n");
await scaffoldProject(testConfig);
