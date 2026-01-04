import type { Generator } from "../../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../../utils/fs";

function getBiomeConfig(linterEnabled: boolean, formatterEnabled: boolean): string {
  const config: any = {
    $schema: "https://biomejs.dev/schemas/1.9.4/schema.json",
    vcs: {
      enabled: true,
      clientKind: "git",
      useIgnoreFile: true,
    },
    organizeImports: {
      enabled: true,
    },
  };

  if (linterEnabled) {
    config.linter = {
      enabled: true,
      rules: {
        recommended: true,
      },
    };
  }

  if (formatterEnabled) {
    config.formatter = {
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
    };
    config.javascript = {
      formatter: {
        quoteStyle: "double",
        semicolons: "always",
      },
    };
  }

  return JSON.stringify(config, null, 2) + "\n";
}

export const biomeGenerator: Generator = {
  name: "biome",
  async apply(dir, config) {
    const linterEnabled = config.linting === "biome";
    const formatterEnabled = config.formatting === "biome";

    await addDependencies(
      dir,
      {
        "@biomejs/biome": "^1.9",
      },
      true,
    );

    const scripts: Record<string, string> = {};

    if (linterEnabled) {
      scripts.lint = "biome lint .";
    }

    if (formatterEnabled) {
      scripts.format = "biome format --write .";
    }

    if (linterEnabled && formatterEnabled) {
      scripts.check = "biome check --write .";
    }

    await addScripts(dir, scripts);

    const biomeConfig = getBiomeConfig(linterEnabled, formatterEnabled);
    await writeProjectFile(dir, "biome.json", biomeConfig);
  },
};
