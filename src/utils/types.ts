export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type Framework = "vite-solid-router" | "solid-start" | "tanstack-start";

export type StyleOption = "none" | "tailwind" | "unocss" | "sass";

export type DatabaseOption = "none" | "drizzle" | "prisma";

export type AuthOption = "none" | "better-auth" | "clerk";

export type ApiOption = "none" | "trpc" | "hono";

export type TestingOption = "none" | "vitest" | "playwright";

export type LintingOption = "none" | "biome" | "eslint" | "oxlint";

export type FormattingOption = "none" | "biome" | "prettier";

export type GitHooksOption = "none" | "husky";

export type DeploymentOption = "none" | "vercel" | "netlify" | "cloudflare";

export interface ProjectConfig {
  name: string;
  directory: string;
  packageManager: PackageManager;
  framework: Framework;
  style: StyleOption;
  database: DatabaseOption;
  auth: AuthOption;
  api: ApiOption;
  testing: TestingOption;
  linting: LintingOption;
  formatting: FormattingOption;
  gitHooks: GitHooksOption;
  deployment: DeploymentOption;
}

export interface Generator {
  name: string;
  apply: (dir: string, config: ProjectConfig) => Promise<void>;
}
