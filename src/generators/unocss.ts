import type { Generator } from "../utils/types";
import { addDependencies, prependToFile, writeProjectFile, readProjectFile } from "../utils/fs";

const unocssConfig = `import { defineConfig, presetUno, presetAttributify, presetIcons } from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
});
`;

export const unocssGenerator: Generator = {
  name: "unocss",
  async apply(dir) {
    await addDependencies(
      dir,
      {
        unocss: "^1",
        "@unocss/vite": "^1",
      },
      true,
    );

    await writeProjectFile(dir, "uno.config.ts", unocssConfig);
    await prependToFile(dir, "src/app.css", "@unocss;");

    const viteConfig = await readProjectFile(dir, "vite.config.ts");
    const updatedConfig = viteConfig.replace(
      /import solid from "vite-plugin-solid";/,
      `import solid from "vite-plugin-solid";
import UnoCSS from "@unocss/vite";`,
    );
    await writeProjectFile(
      dir,
      "vite.config.ts",
      updatedConfig.replace(/plugins: \[solid\(\)\]/, "plugins: [solid(), UnoCSS()]"),
    );
  },
};
