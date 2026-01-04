import type { Generator } from "../../utils/types";
import { addDependencies, prependToFile, writeProjectFile } from "../../utils/fs";
import { getAdapter } from "../../adapters";

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
  async apply(dir, config) {
    const adapter = getAdapter(config.framework);

    await addDependencies(
      dir,
      {
        unocss: "^66",
        "@unocss/vite": "^66",
      },
      true,
    );

    await writeProjectFile(dir, "uno.config.ts", unocssConfig);
    await prependToFile(dir, adapter.cssEntryPath, '@import "@unocss/reset/tailwind.css";');

    await adapter.addPlugin(
      dir,
      {
        name: "UnoCSS",
        from: "@unocss/vite",
        default: true,
      },
      "UnoCSS()",
    );
  },
};
