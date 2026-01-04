import type { Generator } from "../../utils/types";
import { writeProjectFile } from "../../utils/fs";
import { addSolidStartServerPreset } from "../../utils/solidstart";

export const netlifyGenerator: Generator = {
  name: "netlify",
  async apply(dir, config) {
    if (config.framework === "solid-start") {
      // SSR: Use Netlify server preset
      await addSolidStartServerPreset(dir, "netlify");
    } else {
      // SPA: Netlify configuration for client-side routing
      const netlifyConfig = `[build]
  publish = "dist"
  command = "npm run build"

# Handle SPA client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Cache static assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;

      await writeProjectFile(dir, "netlify.toml", netlifyConfig);
    }
  },
};
