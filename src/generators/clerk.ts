import type { Generator } from "../utils/types";
import { addDependencies, addEnvVar, writeProjectFile } from "../utils/fs";

export const clerkGenerator: Generator = {
  name: "clerk",
  async apply(dir, _config) {
    await addDependencies(dir, {
      "clerk-solidjs": "^0.5",
    });

    await addEnvVar(dir, "VITE_CLERK_PUBLISHABLE_KEY", "pk_test_your-publishable-key");
    await addEnvVar(dir, "CLERK_SECRET_KEY", "sk_test_your-secret-key");

    await writeProjectFile(
      dir,
      "src/lib/clerk.tsx",
      `import { ClerkProvider } from "clerk-solidjs";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export function ClerkWrapper(props: { children: any }) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {props.children}
    </ClerkProvider>
  );
}
`,
    );

    await writeProjectFile(
      dir,
      "src/components/Auth.tsx",
      `import { SignedIn, SignedOut, SignInButton, UserButton } from "clerk-solidjs";

export function Auth() {
  return (
    <div class="p-4">
      <SignedOut>
        <SignInButton mode="modal">
          <button class="bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div class="flex items-center gap-4">
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
`,
    );
  },
};
