import type { Generator, ProjectConfig } from "../utils/types";
import { tailwindGenerator } from "./styles/tailwind";
import { unocssGenerator } from "./styles/unocss";
import { sassGenerator } from "./styles/sass";
import { drizzleGenerator } from "./database/drizzle";
import { prismaGenerator } from "./database/prisma";
import { vitestGenerator } from "./testing/vitest";
import { playwrightGenerator } from "./testing/playwright";
import { biomeGenerator } from "./linting/biome";
import { prettierGenerator } from "./formatting/prettier";
import { gitHooksGenerator } from "./git/git-hooks";
import { eslintGenerator } from "./linting/eslint";
import { oxlintGenerator } from "./linting/oxlint";
import { betterAuthGenerator } from "./auth/better-auth";
import { clerkGenerator } from "./auth/clerk";
import { trpcGenerator } from "./api/trpc";
import { honoGenerator } from "./api/hono";
import { vercelGenerator } from "./deployment/vercel";
import { netlifyGenerator } from "./deployment/netlify";
import { cloudflareGenerator } from "./deployment/cloudflare";
import { homepageGenerator } from "./homepage";

// Registry of all available generators
const generators: Record<string, Generator> = {
  tailwind: tailwindGenerator,
  unocss: unocssGenerator,
  sass: sassGenerator,
  drizzle: drizzleGenerator,
  prisma: prismaGenerator,
  vitest: vitestGenerator,
  playwright: playwrightGenerator,
  biome: biomeGenerator,
  prettier: prettierGenerator,
  "git-hooks": gitHooksGenerator,
  eslint: eslintGenerator,
  oxlint: oxlintGenerator,
  "better-auth": betterAuthGenerator,
  clerk: clerkGenerator,
  trpc: trpcGenerator,
  hono: honoGenerator,
  vercel: vercelGenerator,
  netlify: netlifyGenerator,
  cloudflare: cloudflareGenerator,
};

/**
 * Get the list of generators to apply based on project config
 */
export function getGeneratorsForConfig(config: ProjectConfig): Generator[] {
  const result: Generator[] = [];

  // Style
  if (config.style === "tailwind") {
    result.push(tailwindGenerator);
  }
  if (config.style === "unocss") {
    result.push(unocssGenerator);
  }
  if (config.style === "sass") {
    result.push(sassGenerator);
  }

  // Database
  if (config.database === "drizzle") {
    result.push(drizzleGenerator);
  }
  if (config.database === "prisma") {
    result.push(prismaGenerator);
  }

  // Testing
  if (config.testing === "vitest") {
    result.push(vitestGenerator);
  }
  if (config.testing === "playwright") {
    result.push(playwrightGenerator);
  }

  // Linting
  if (config.linting === "eslint") {
    result.push(eslintGenerator);
  }
  if (config.linting === "oxlint") {
    result.push(oxlintGenerator);
  }

  // Formatting
  if (config.formatting === "prettier") {
    result.push(prettierGenerator);
  }

  // Biome (handles both linting and/or formatting based on config)
  if (config.linting === "biome" || config.formatting === "biome") {
    result.push(biomeGenerator);
  }

  // Git hooks (husky + lint-staged)
  if (config.gitHooks === "husky") {
    result.push(gitHooksGenerator);
  }

  // Authentication
  if (config.auth === "better-auth") {
    result.push(betterAuthGenerator);
  }
  if (config.auth === "clerk") {
    result.push(clerkGenerator);
  }

  // API
  if (config.api === "trpc") {
    result.push(trpcGenerator);
  }
  if (config.api === "hono") {
    result.push(honoGenerator);
  }

  // Deployment
  if (config.deployment === "vercel") {
    result.push(vercelGenerator);
  }
  if (config.deployment === "netlify") {
    result.push(netlifyGenerator);
  }
  if (config.deployment === "cloudflare") {
    result.push(cloudflareGenerator);
  }

  return result;
}

/**
 * Apply all generators for a project config
 */
export async function applyGenerators(dir: string, config: ProjectConfig): Promise<void> {
  const generatorsToApply = getGeneratorsForConfig(config);

  for (const generator of generatorsToApply) {
    console.log(`Applying ${generator.name}...`);
    await generator.apply(dir, config);
  }

  // Homepage generator runs last to aggregate all features
  console.log("Generating homepage...");
  await homepageGenerator.apply(dir, config);
}

export { generators };
