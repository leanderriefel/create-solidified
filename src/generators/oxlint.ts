import type { Generator } from "../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../utils/fs";

const oxlintConfig = `{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "env": {
    "browser": true,
    "es2021": true
  },
  "plugins": ["typescript"],
  "rules": {
    "eslint/no-unused-vars": "error",
    "typescript/no-explicit-any": "warn",
    "typescript/no-unused-vars": "error"
  },
  "overrides": [
    {
      "files": ["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"],
      "rules": {
        "typescript/no-explicit-any": "off"
      }
    }
  ]
}
`;

export const oxlintGenerator: Generator = {
  name: "oxlint",
  async apply(dir) {
    await addDependencies(
      dir,
      {
        oxlint: "^1",
      },
      true,
    );

    await addScripts(dir, {
      lint: "oxlint",
      "lint:fix": "oxlint --fix",
    });

    await writeProjectFile(dir, ".oxlintrc.json", oxlintConfig);
  },
};
