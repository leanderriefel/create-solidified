import type { Generator } from "../../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../../utils/fs";

const prettierConfig = `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;

const prettierIgnore = `node_modules
dist
build
.next
coverage
*.lock
package-lock.json
pnpm-lock.yaml
yarn.lock
bun.lockb
`;

export const prettierGenerator: Generator = {
  name: "prettier",
  async apply(dir) {
    await addDependencies(
      dir,
      {
        prettier: "^3",
      },
      true,
    );

    await addScripts(dir, {
      format: "prettier --write .",
      "format:check": "prettier --check .",
    });

    await writeProjectFile(dir, ".prettierrc", prettierConfig);
    await writeProjectFile(dir, ".prettierignore", prettierIgnore);
  },
};
