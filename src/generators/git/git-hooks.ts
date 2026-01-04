import type { Generator, ProjectConfig } from "../../utils/types";
import {
  addDependencies,
  addScripts,
  writeProjectFile,
  readPackageJson,
  writePackageJson,
} from "../../utils/fs";
import { getExecCommand } from "../../utils/package-manager";

function getPreCommitHook(pm: ProjectConfig["packageManager"]): string {
  return `${getExecCommand(pm)} lint-staged\n`;
}

function getLintStagedConfig(config: ProjectConfig): Record<string, string[]> {
  const configMap: Record<string, string[]> = {};

  const linting = config.linting;
  const formatting = config.formatting;

  const hasBiome = linting === "biome" || formatting === "biome";
  const hasPrettier = formatting === "prettier";

  const commands: string[] = [];

  if (hasBiome) {
    commands.push("biome check --write --no-errors-on-unmatched");
  }

  if (hasPrettier && !hasBiome) {
    commands.push("prettier --write");
  }

  if (linting === "eslint") {
    commands.push("eslint --fix");
  }

  if (linting === "oxlint") {
    commands.push("oxlint --fix");
  }

  if (commands.length > 0) {
    configMap["*.{js,jsx,ts,tsx}"] = commands;
    configMap["*.{json,md}"] = hasBiome
      ? ["biome check --write --no-errors-on-unmatched"]
      : hasPrettier
        ? ["prettier --write"]
        : [];
  }

  return configMap;
}

export const gitHooksGenerator: Generator = {
  name: "git-hooks",
  async apply(dir, config) {
    await addDependencies(
      dir,
      {
        husky: "^9",
        "lint-staged": "^16.2.7",
      },
      true,
    );

    await addScripts(dir, {
      prepare: "husky",
      "lint-staged": "lint-staged",
    });

    const preCommitHook = getPreCommitHook(config.packageManager);
    await writeProjectFile(dir, ".husky/pre-commit", preCommitHook);

    const lintStagedConfig = getLintStagedConfig(config);

    if (Object.keys(lintStagedConfig).length > 0) {
      const pkg = await readPackageJson(dir);
      pkg["lint-staged"] = lintStagedConfig;
      await writePackageJson(dir, pkg);
    }
  },
};
