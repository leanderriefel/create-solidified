import type { Generator } from "../../utils/types";
import { addDependencies, addEnvVar, writeProjectFile } from "../../utils/fs";
import { getAdapter } from "../../adapters";

export const clerkGenerator: Generator = {
  name: "clerk",
  async apply(dir, config) {
    const adapter = getAdapter(config.framework);
    const envPrefix = adapter.envPrefix;

    await addDependencies(dir, {
      "clerk-solidjs": "^0.5",
    });

    await addEnvVar(dir, `${envPrefix}CLERK_PUBLISHABLE_KEY`, "pk_test_your-publishable-key");
    await addEnvVar(dir, "CLERK_SECRET_KEY", "sk_test_your-secret-key");

    await writeProjectFile(
      dir,
      "src/lib/clerk.tsx",
      `import { ClerkProvider } from "clerk-solidjs";
import type { ParentProps } from "solid-js";

const PUBLISHABLE_KEY = import.meta.env.${envPrefix}CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export function ClerkWrapper(props: ParentProps) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {props.children}
    </ClerkProvider>
  );
}
`,
    );
  },
};
