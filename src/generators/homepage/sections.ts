import type { ProjectConfig } from "../../utils/types";

export interface HomepageSection {
  id: string;
  imports: string[];
  component: string;
  inlineComponents?: string;
}

export function buildSections(config: ProjectConfig): HomepageSection[] {
  const sections: HomepageSection[] = [];

  // API + Database combined section (highest priority)
  const apiDbSection = buildApiDatabaseSection(config);
  if (apiDbSection) sections.push(apiDbSection);

  // Auth section
  const authSection = buildAuthSection(config);
  if (authSection) sections.push(authSection);

  // Standalone API (if no database combined section)
  if (!apiDbSection) {
    const apiSection = buildStandaloneApiSection(config);
    if (apiSection) sections.push(apiSection);
  }

  return sections;
}

function buildApiDatabaseSection(config: ProjectConfig): HomepageSection | null {
  // TRPC + Drizzle
  if (config.api === "trpc" && config.database === "drizzle") {
    return {
      id: "api-db",
      imports: [
        'import { Show, For } from "solid-js";',
        'import { useUsers } from "../lib/trpc/hooks";',
      ],
      inlineComponents: `function UsersList() {
  const users = useUsers();
  return (
    <Show when={!users.isLoading} fallback={<p class="text-muted text-sm">Loading users...</p>}>
      <Show when={users.data?.length} fallback={<p class="text-muted text-sm">No users yet</p>}>
        <ul class="text-sm">
          <For each={users.data}>{(user) => <li>{user.email}</li>}</For>
        </ul>
      </Show>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>Database</h2>
        <UsersList />
      </section>`,
    };
  }

  // TRPC + Prisma
  if (config.api === "trpc" && config.database === "prisma") {
    return {
      id: "api-db",
      imports: [
        'import { Show, For } from "solid-js";',
        'import { useUsers } from "../lib/trpc/hooks";',
      ],
      inlineComponents: `function UsersList() {
  const users = useUsers();
  return (
    <Show when={!users.isLoading} fallback={<p class="text-muted text-sm">Loading users...</p>}>
      <Show when={users.data?.length} fallback={<p class="text-muted text-sm">No users yet</p>}>
        <ul class="text-sm">
          <For each={users.data}>{(user) => <li>{user.email}</li>}</For>
        </ul>
      </Show>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>Database</h2>
        <UsersList />
      </section>`,
    };
  }

  // Hono + Drizzle
  if (config.api === "hono" && config.database === "drizzle") {
    return {
      id: "api-db",
      imports: ['import { createResource, Show, For } from "solid-js";'],
      inlineComponents: `function UsersList() {
  const [users] = createResource(async () => {
    const res = await fetch("/api/users");
    return res.json();
  });
  return (
    <Show when={!users.loading} fallback={<p class="text-muted text-sm">Loading users...</p>}>
      <Show when={users()?.length} fallback={<p class="text-muted text-sm">No users yet</p>}>
        <ul class="text-sm">
          <For each={users()}>{(user: any) => <li>{user.email}</li>}</For>
        </ul>
      </Show>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>Database</h2>
        <UsersList />
      </section>`,
    };
  }

  // Hono + Prisma
  if (config.api === "hono" && config.database === "prisma") {
    return {
      id: "api-db",
      imports: ['import { createResource, Show, For } from "solid-js";'],
      inlineComponents: `function UsersList() {
  const [users] = createResource(async () => {
    const res = await fetch("/api/users");
    return res.json();
  });
  return (
    <Show when={!users.loading} fallback={<p class="text-muted text-sm">Loading users...</p>}>
      <Show when={users()?.length} fallback={<p class="text-muted text-sm">No users yet</p>}>
        <ul class="text-sm">
          <For each={users()}>{(user: any) => <li>{user.email}</li>}</For>
        </ul>
      </Show>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>Database</h2>
        <UsersList />
      </section>`,
    };
  }

  return null;
}

function buildAuthSection(config: ProjectConfig): HomepageSection | null {
  if (config.auth === "better-auth") {
    return {
      id: "auth",
      imports: [
        'import { Show } from "solid-js";',
        'import { useSession, signOut } from "../lib/auth/client";',
      ],
      inlineComponents: `function AuthStatus() {
  const session = useSession();
  return (
    <Show
      when={session()?.user}
      fallback={<p class="text-muted text-sm">Not signed in</p>}
    >
      <div class="flex items-center gap-2">
        <span class="text-sm">{session()?.user?.email}</span>
        <button class="btn btn-secondary" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>Auth</h2>
        <AuthStatus />
      </section>`,
    };
  }

  if (config.auth === "clerk") {
    return {
      id: "auth",
      imports: ['import { SignedIn, SignedOut, SignInButton, UserButton } from "clerk-solidjs";'],
      component: `      <section class="card">
        <h2>Auth</h2>
        <SignedIn>
          <div class="flex items-center gap-2">
            <span class="text-sm">Signed in</span>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button class="btn btn-primary">Sign in</button>
          </SignInButton>
        </SignedOut>
      </section>`,
    };
  }

  return null;
}

function buildStandaloneApiSection(config: ProjectConfig): HomepageSection | null {
  if (config.api === "trpc") {
    return {
      id: "api",
      imports: [
        'import { Show } from "solid-js";',
        'import { useHello } from "../lib/trpc/hooks";',
      ],
      inlineComponents: `function HelloMessage() {
  const hello = useHello();
  return (
    <Show when={!hello.isLoading} fallback={<p class="text-muted text-sm">Loading...</p>}>
      <p class="text-sm">{hello.data?.greeting}</p>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>API</h2>
        <HelloMessage />
      </section>`,
    };
  }

  if (config.api === "hono") {
    return {
      id: "api",
      imports: ['import { createResource, Show } from "solid-js";'],
      inlineComponents: `function ApiMessage() {
  const [data] = createResource(async () => {
    const res = await fetch("/api/hello");
    return res.json();
  });
  return (
    <Show when={!data.loading} fallback={<p class="text-muted text-sm">Loading...</p>}>
      <p class="text-sm">{data()?.message}</p>
    </Show>
  );
}`,
      component: `      <section class="card">
        <h2>API</h2>
        <ApiMessage />
      </section>`,
    };
  }

  return null;
}
