import type { Generator } from "../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../utils/fs";

const playwrightConfig = `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
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
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
`;

const exampleTest = `import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.*SolidJS/);
});

test("navigation works", async ({ page }) => {
  await page.goto("/");
  await page.click("text=About");
  await expect(page).toHaveURL(/.*about/);
});
`;

export const playwrightGenerator: Generator = {
  name: "playwright",
  async apply(dir) {
    await addDependencies(
      dir,
      {
        "@playwright/test": "^1",
      },
      true,
    );

    await addScripts(dir, {
      test: "playwright test",
      "test:ui": "playwright test --ui",
      "test:headed": "playwright test --headed",
    });

    await writeProjectFile(dir, "playwright.config.ts", playwrightConfig);
    await writeProjectFile(dir, "e2e/example.spec.ts", exampleTest);
  },
};
