import type { Generator } from "../../utils/types";
import { addDependencies } from "../../utils/fs";
import { addViteConfig } from "../../utils/vite";

export const sassGenerator: Generator = {
  name: "sass",
  async apply(dir, _config) {
    await addDependencies(dir, { sass: "^1" }, true);

    await addViteConfig(
      dir,
      "css",
      `{
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  }`,
    );
  },
};
