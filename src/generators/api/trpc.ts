import type { Generator } from "../../utils/types";
import { addDependencies, writeProjectFile } from "../../utils/fs";

export const trpcGenerator: Generator = {
  name: "trpc",
  async apply(dir, config) {
    await addDependencies(dir, {
      "@trpc/server": "^11",
      "@trpc/client": "^11",
      "@tanstack/solid-query": "^5",
      zod: "^4.3.5",
    });

    // Server-side tRPC router setup
    await writeProjectFile(
      dir,
      "src/lib/trpc/server.ts",
      `import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
`,
    );

    // Router content depends on database selection
    const hasDatabase = config.database !== "none";
    const routerContent = hasDatabase ? getRouterWithDatabase(config.database) : getBasicRouter();

    await writeProjectFile(dir, "src/lib/trpc/router.ts", routerContent);

    // Client-side tRPC setup with TanStack Query
    await writeProjectFile(
      dir,
      "src/lib/trpc/client.ts",
      `import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./router";

export const trpc = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "/api/trpc",
		}),
	],
});
`,
    );

    // TanStack Query provider for SolidJS
    await writeProjectFile(
      dir,
      "src/lib/trpc/QueryProvider.tsx",
      `import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import type { ParentProps } from "solid-js";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			retry: 1,
		},
	},
});

export function QueryProvider(props: ParentProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{props.children}
		</QueryClientProvider>
	);
}
`,
    );

    // Hooks content depends on database selection
    const hooksContent = hasDatabase ? getHooksWithDatabase() : getBasicHooks();
    await writeProjectFile(dir, "src/lib/trpc/hooks.ts", hooksContent);

    // For SolidStart, create native API route handler
    if (config.framework === "solid-start") {
      await writeProjectFile(
        dir,
        "src/routes/api/trpc/[...trpc].ts",
        `import { type APIEvent } from "@solidjs/start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/lib/trpc/router";

const handler = (event: APIEvent) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req: event.request,
		router: appRouter,
		createContext: () => ({}),
	});

export const GET = handler;
export const POST = handler;
`,
      );
    }
  },
};

function getBasicRouter(): string {
  return `import { z } from "zod";
import { router, publicProcedure } from "./server";

export const appRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input }) => {
			return { greeting: \`Hello \${input.name ?? "World"}!\` };
		}),
});

export type AppRouter = typeof appRouter;
`;
}

function getRouterWithDatabase(database: string): string {
  const dbImport =
    database === "drizzle"
      ? `import { db } from "../../db";
import { users } from "../../db/schema";`
      : `import { prisma } from "../../db";`;

  const usersQuery =
    database === "drizzle"
      ? `return await db.select().from(users).limit(10);`
      : `return await prisma.user.findMany({ take: 10 });`;

  return `import { z } from "zod";
import { router, publicProcedure } from "./server";
${dbImport}

export const appRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input }) => {
			return { greeting: \`Hello \${input.name ?? "World"}!\` };
		}),

	users: publicProcedure.query(async () => {
		${usersQuery}
	}),
});

export type AppRouter = typeof appRouter;
`;
}

function getBasicHooks(): string {
  return `import { createQuery } from "@tanstack/solid-query";
import { trpc } from "./client";

export function useHello(name?: string) {
	return createQuery(() => ({
		queryKey: ["hello", name],
		queryFn: () => trpc.hello.query({ name }),
	}));
}
`;
}

function getHooksWithDatabase(): string {
  return `import { createQuery } from "@tanstack/solid-query";
import { trpc } from "./client";

export function useHello(name?: string) {
	return createQuery(() => ({
		queryKey: ["hello", name],
		queryFn: () => trpc.hello.query({ name }),
	}));
}

export function useUsers() {
	return createQuery(() => ({
		queryKey: ["users"],
		queryFn: () => trpc.users.query(),
	}));
}
`;
}
