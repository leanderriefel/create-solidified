import type { Generator } from "../utils/types";
import { addDependencies, addScripts, writeProjectFile } from "../utils/fs";

const vitestConfig = `import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
`;

const setupFile = `import "@testing-library/jest-dom/vitest";
`;

const exampleTest = `import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";

describe("Example", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
`;

export const vitestGenerator: Generator = {
  name: "vitest",
  async apply(dir) {
    // Add dependencies
    await addDependencies(
      dir,
      {
        vitest: "^3",
        jsdom: "^26",
        "@solidjs/testing-library": "^0.8",
        "@testing-library/jest-dom": "^6",
      },
      true,
    );

    // Add test scripts
    await addScripts(dir, {
      test: "vitest",
      "test:ui": "vitest --ui",
      "test:coverage": "vitest --coverage",
    });

    // Write config files
    await writeProjectFile(dir, "vitest.config.ts", vitestConfig);
    await writeProjectFile(dir, "src/test/setup.ts", setupFile);
    await writeProjectFile(dir, "src/test/example.test.ts", exampleTest);
  },
};
