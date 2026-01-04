import type { Generator, ProjectConfig } from "../utils/types";
import {
  addDependencies,
  addScripts,
  writeProjectFile,
  readPackageJson,
  writePackageJson,
} from "../utils/fs";

const preCommitHook = `npx lint-staged
`;

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
        "lint-staged": "^15",
      },
      true,
    );

    await addScripts(dir, {
      prepare: "husky",
      "lint-staged": "lint-staged",
    });

    await writeProjectFile(dir, ".husky/pre-commit", preCommitHook);

    const lintStagedConfig = getLintStagedConfig(config);

    if (Object.keys(lintStagedConfig).length > 0) {
      const pkg = await readPackageJson(dir);
      pkg["lint-staged"] = lintStagedConfig;
      await writePackageJson(dir, pkg);
    }
  },
};
