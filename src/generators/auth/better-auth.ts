import type { Generator } from "../../utils/types";
import { addDependencies, addEnvVar, writeProjectFile } from "../../utils/fs";
import { getAdapter } from "../../adapters";

export const betterAuthGenerator: Generator = {
  name: "better-auth",
  async apply(dir, config) {
    const adapter = getAdapter(config.framework);
    const envPrefix = adapter.envPrefix;

    await addDependencies(dir, {
      "better-auth": "^1.2",
    });

    await addEnvVar(dir, "BETTER_AUTH_SECRET", "your-secret-key-here");
    await addEnvVar(dir, "BETTER_AUTH_URL", `http://localhost:${adapter.devPort}`);
    await addEnvVar(dir, `${envPrefix}BETTER_AUTH_URL`, `http://localhost:${adapter.devPort}`);

    await writeProjectFile(
      dir,
      "src/lib/auth/server.ts",
      `import { betterAuth } from "better-auth";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:${adapter.devPort}",
	secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key",
});
`,
    );

    await writeProjectFile(
      dir,
      "src/lib/auth/client.ts",
      `import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
	baseURL: import.meta.env.${envPrefix}BETTER_AUTH_URL || "http://localhost:${adapter.devPort}",
});

export const { signIn, signOut, signUp, useSession } = authClient;
`,
    );

    // For SolidStart, create native API route handler
    if (config.framework === "solid-start") {
      await writeProjectFile(
        dir,
        "src/routes/api/auth/[...auth].ts",
        `import { auth } from "~/lib/auth/server";
import { toSolidStartHandler } from "better-auth/solid-start";

export const { GET, POST } = toSolidStartHandler(auth);
`,
      );
    }
  },
};
