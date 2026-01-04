import type { Generator } from "../../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../../utils/fs";
import { getAdapter } from "../../adapters";
import { getRunCommand } from "../../utils/package-manager";

export const playwrightGenerator: Generator = {
  name: "playwright",
  async apply(dir, config) {
    const adapter = getAdapter(config.framework);
    const devCommand = `${getRunCommand(config.packageManager)} dev`;

    const playwrightConfig = `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:${adapter.devPort}",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: "${devCommand}",
    url: "http://localhost:${adapter.devPort}",
    reuseExistingServer: !process.env.CI,
  },
});
`;

    const exampleTest = `import { test, expect } from "@playwright/test";

 test("homepage has title", async ({ page }) => {
   await page.goto("/");
   await expect(page.locator("h1")).toBeVisible();
 });
 `;

    await addDependencies(
      dir,
      {
        "@playwright/test": "^1",
      },
      true,
    );

    await addScripts(dir, {
      "test:e2e": "playwright test",
      "test:e2e:ui": "playwright test --ui",
      "test:e2e:headed": "playwright test --headed",
    });

    await writeProjectFile(dir, "playwright.config.ts", playwrightConfig);
    await writeProjectFile(dir, "e2e/example.spec.ts", exampleTest);
  },
};
