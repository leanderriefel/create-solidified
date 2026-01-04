import type { Generator } from "../../utils/types";
import { addDependencies, writeProjectFile } from "../../utils/fs";

export const honoGenerator: Generator = {
  name: "hono",
  async apply(dir, config) {
    await addDependencies(dir, {
      hono: "^4",
    });

    // Server content depends on database selection
    const hasDatabase = config.database !== "none";
    const serverContent = hasDatabase ? getServerWithDatabase(config.database) : getBasicServer();

    await writeProjectFile(dir, "src/lib/api/server.ts", serverContent);

    // Client-side Hono RPC setup
    await writeProjectFile(
      dir,
      "src/lib/api/client.ts",
      `import { hc } from "hono/client";
import type { AppType } from "./server";

export const client = hc<AppType>("/");

export const api = {
	hello: async (name?: string) => {
		const res = await client.api.hello.$get({
			query: { name: name ?? "" },
		});
		return res.json();
	},
${hasDatabase ? getUsersApiMethod() : ""}};
`,
    );

    // For SolidStart, create native API route handler
    if (config.framework === "solid-start") {
      await writeProjectFile(
        dir,
        "src/routes/api/[...path].ts",
        `import { type APIEvent } from "@solidjs/start/server";
import { app } from "~/lib/api/server";

const handler = (event: APIEvent) => app.fetch(event.request);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
`,
      );
    }
  },
};

function getBasicServer(): string {
  return `import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono()
	.use("*", cors())
	.basePath("/api");

const routes = app
	.get("/hello", (c) => {
		const name = c.req.query("name") ?? "World";
		return c.json({ message: \`Hello \${name}!\` });
	});

export type AppType = typeof routes;
export { app };
`;
}

function getServerWithDatabase(database: string): string {
  const dbImport =
    database === "drizzle"
      ? `import { db } from "../../db";
import { users } from "../../db/schema";`
      : `import { prisma } from "../../db";`;

  const usersQuery =
    database === "drizzle"
      ? `const data = await db.select().from(users).limit(10);
		return c.json(data);`
      : `const data = await prisma.user.findMany({ take: 10 });
		return c.json(data);`;

  return `import { Hono } from "hono";
import { cors } from "hono/cors";
${dbImport}

const app = new Hono()
	.use("*", cors())
	.basePath("/api");

const routes = app
	.get("/hello", (c) => {
		const name = c.req.query("name") ?? "World";
		return c.json({ message: \`Hello \${name}!\` });
	})
	.get("/users", async (c) => {
		${usersQuery}
	});

export type AppType = typeof routes;
export { app };
`;
}

function getUsersApiMethod(): string {
  return `
	users: async () => {
		const res = await client.api.users.$get();
		return res.json();
	},
`;
}
