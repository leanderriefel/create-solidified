import type { Generator } from "../utils/types";
import { addDependencies, addEnvVar, writeProjectFile } from "../utils/fs";

export const betterAuthGenerator: Generator = {
  name: "better-auth",
  async apply(dir, _config) {
    await addDependencies(dir, {
      "better-auth": "^1.0",
    });

    await addEnvVar(dir, "BETTER_AUTH_SECRET", "your-secret-key-here");
    await addEnvVar(dir, "BETTER_AUTH_URL", "http://localhost:5173");

    await writeProjectFile(
      dir,
      "src/lib/auth.ts",
      `import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5173",
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key",
});
`,
    );

    await writeProjectFile(
      dir,
      "src/lib/auth-client.ts",
      `import { createAuthClient } from "better-auth/solid";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:5173",
});

export const { signIn, signOut, signUp, useSession } = authClient;
`,
    );

    await writeProjectFile(
      dir,
      "src/components/Auth.tsx",
      `import { createSignal, Show } from "solid-js";
import { signIn, signOut, useSession } from "../lib/auth-client";

export function Auth() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const session = useSession();

  return (
    <div class="p-4">
      <Show
        when={session.data?.user}
        fallback={
          <div class="flex flex-col gap-2 max-w-xs">
            <input
              type="email"
              placeholder="Email"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="border p-2 rounded"
            />
            <button
              onClick={async () => {
                await signIn.email({
                  email: email(),
                  password: password(),
                });
              }}
              class="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign In
            </button>
          </div>
        }
      >
        <div class="flex items-center gap-4">
          <span>Welcome, {session.data?.user?.email}</span>
          <button
            onClick={async () => {
              await signOut();
            }}
            class="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      </Show>
    </div>
  );
}
`,
    );
  },
};
