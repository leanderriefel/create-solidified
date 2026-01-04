import type { Generator, ProjectConfig } from "../utils/types";
import { tailwindGenerator } from "./tailwind";
import { unocssGenerator } from "./unocss";
import { sassGenerator } from "./sass";
import { drizzleGenerator } from "./drizzle";
import { prismaGenerator } from "./prisma";
import { vitestGenerator } from "./vitest";
import { playwrightGenerator } from "./playwright";
import { biomeGenerator } from "./biome";
import { prettierGenerator } from "./prettier";
import { gitHooksGenerator } from "./git-hooks";
import { eslintGenerator } from "./eslint";
import { oxlintGenerator } from "./oxlint";
import { betterAuthGenerator } from "./better-auth";
import { clerkGenerator } from "./clerk";

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
}

export { generators };
