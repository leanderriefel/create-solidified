import type { Generator } from "../utils/types";
import { addDependencies, prependToFile } from "../utils/fs";
import { addVitePlugin } from "../utils/vite";

export const tailwindGenerator: Generator = {
  name: "tailwind",
  async apply(dir) {
    // Add dependencies
    await addDependencies(
      dir,
      {
        tailwindcss: "^4",
        "@tailwindcss/vite": "^4",
      },
      true,
    );

    // Add Tailwind import to CSS
    await prependToFile(dir, "src/app.css", '@import "tailwindcss";');

    // Add Vite plugin
    await addVitePlugin(
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
