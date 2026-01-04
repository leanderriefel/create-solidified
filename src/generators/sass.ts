import type { Generator } from "../utils/types";
import { addDependencies, readProjectFile, writeProjectFile } from "../utils/fs";

export const sassGenerator: Generator = {
  name: "sass",
  async apply(dir) {
    await addDependencies(dir, { sass: "^1" }, true);

    const viteConfig = await readProjectFile(dir, "vite.config.ts");
    const updatedConfig = viteConfig.replace(
      /export default defineConfig\(\{/,
      `export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },`,
    );
    await writeProjectFile(dir, "vite.config.ts", updatedConfig);
  },
};
