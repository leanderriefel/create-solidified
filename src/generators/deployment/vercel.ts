import type { Generator } from "../../utils/types";
import { writeProjectFile } from "../../utils/fs";
import { addSolidStartServerPreset } from "../../utils/solidstart";

export const vercelGenerator: Generator = {
  name: "vercel",
  async apply(dir, config) {
    if (config.framework === "solid-start") {
      // SSR: Use Vercel server preset
      await addSolidStartServerPreset(dir, "vercel");
    } else {
      // SPA: Vercel configuration for client-side routing
      const vercelConfig = {
        rewrites: [
          {
            source: "/(.*)",
            destination: "/index.html",
          },
        ],
        headers: [
          {
            source: "/assets/(.*)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
            ],
          },
        ],
      };

      await writeProjectFile(dir, "vercel.json", JSON.stringify(vercelConfig, null, 2) + "\n");
    }
  },
};
