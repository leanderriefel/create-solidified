import type { Generator } from "../../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../../utils/fs";

const eslintConfig = `import js from "@eslint/js";
import solid from "eslint-plugin-solid";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...solid.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  {
    ignores: ["dist", "node_modules"],
  },
);
`;

export const eslintGenerator: Generator = {
  name: "eslint",
  async apply(dir) {
    await addDependencies(
      dir,
      {
        eslint: "^9",
        "@eslint/js": "^9",
        "typescript-eslint": "^8",
        "eslint-plugin-solid": "^0.14",
        globals: "^15",
      },
      true,
    );

    await addScripts(dir, {
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
    });

    await writeProjectFile(dir, "eslint.config.mjs", eslintConfig);
  },
};
