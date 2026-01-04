import type { Generator } from "../../utils/types";
import { addDependencies, prependToFile } from "../../utils/fs";
import { getAdapter } from "../../adapters";

export const tailwindGenerator: Generator = {
  name: "tailwind",
  async apply(dir, config) {
    const adapter = getAdapter(config.framework);

    await addDependencies(
      dir,
      {
        tailwindcss: "^4",
        "@tailwindcss/vite": "^4",
      },
      true,
    );

    await prependToFile(dir, adapter.cssEntryPath, '@import "tailwindcss";');

    await adapter.addPlugin(
      dir,
      {
        name: "tailwindcss",
        from: "@tailwindcss/vite",
        default: true,
      },
      "tailwindcss()",
    );
  },
};
