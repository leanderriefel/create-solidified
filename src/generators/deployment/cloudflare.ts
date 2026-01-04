import type { Generator } from "../../utils/types";
import { writeProjectFile } from "../../utils/fs";
import { addSolidStartServerPreset } from "../../utils/solidstart";

export const cloudflareGenerator: Generator = {
  name: "cloudflare",
  async apply(dir, config) {
    if (config.framework === "solid-start") {
      // SSR: Use Cloudflare Pages preset with required config for async_hooks
      const additionalConfig = `    rollupConfig: {
      external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
    },`;
      await addSolidStartServerPreset(dir, "cloudflare-pages", additionalConfig);

      // Add wrangler.toml for node compatibility
      const wranglerConfig = `name = "my-app"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = ".output/public"
`;
      await writeProjectFile(dir, "wrangler.toml", wranglerConfig);
    } else {
      // SPA: Cloudflare Pages _routes.json for function invocation routing
      const routesConfig = {
        version: 1,
        include: ["/*"],
        exclude: ["/assets/*"],
      };

      await writeProjectFile(
        dir,
        "public/_routes.json",
        JSON.stringify(routesConfig, null, 2) + "\n",
      );

      // Cloudflare Pages _headers for caching static assets
      const headersConfig = `/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;

      await writeProjectFile(dir, "public/_headers", headersConfig);

      // Cloudflare Pages _redirects for SPA routing fallback
      const redirectsConfig = `/*  /index.html  200
`;

      await writeProjectFile(dir, "public/_redirects", redirectsConfig);
    }
  },
};
